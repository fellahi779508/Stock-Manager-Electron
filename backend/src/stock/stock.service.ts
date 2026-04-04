import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { Batch } from 'src/batch/entities/batch.entity';
import { Stock } from './entities/stock.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, LessThan, Like, Repository } from 'typeorm';
import { Log } from 'src/logs/entities/log.entity';
import { Types, Actions, Reasons } from 'utils/actions';

@Injectable()
export class StockService {
  logRepo: Repository<Log>;
  constructor(
    @InjectRepository(Stock) private stockRepository: Repository<Stock>,
    private readonly datasource: DataSource,
  ) {
    this.logRepo = this.datasource.getRepository(Log);
  }
  async create(createStockDto: CreateStockDto, batch: Batch) {
    const stock = this.stockRepository.create(createStockDto);
    stock.batch = batch;
    console.log(stock);
    return await this.stockRepository.save(stock);
  }

  async findAll(page: number, limit: number, search?: string) {
    if (search) {
      const [items, total] = await this.stockRepository.findAndCount({
        where: [
          { batch: { variant: { name: ILike(`%${search}%`) } } },
          { batch: { variant: { barcode: Like(`%${search}%`) } } },
        ],
        take: limit,
        skip: (page - 1) * limit,
        relations: ['batch', 'batch.variant'],
      });
      return {
        data: items,
        meta: { total, page, limit, pages: Math.ceil(total / limit) },
      };
    }
    const [items, total] = await this.stockRepository.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
      relations: ['batch', 'batch.variant', 'batch.supplier'],
    });
    return {
      data: items,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  async getStockByBarcode(barcode: string) {
    const stock = await this.stockRepository.findOne({
      where: { batch: { variant: { barcode } } },
      relations: ['batch', 'batch.variant'],
    });
    if (!stock) {
      throw new NotFoundException('Stock not found');
    }
    return stock;
  }

  async findOne(id: number) {
    const stock = await this.stockRepository.findOne({
      where: { id },
      relations: ['batch'],
    });
    if (!stock) {
      throw new NotFoundException('Stock not found');
    }
    return stock;
  }

  async update(id: number, updateStockDto: UpdateStockDto) {
    const stock = await this.stockRepository.preload({
      id,
      ...updateStockDto,
    });
    if (!stock) {
      throw new NotFoundException('Stock not found');
    }
    return this.stockRepository.save(stock);
  }

  async remove(id: number) {
    const stock = await this.findOne(id);
    return await this.stockRepository.remove(stock);
  }

  //dev only
  async cleareAll() {
    return await this.stockRepository.clear();
  }

  async removeFromStock(id: number, dto: UpdateStockDto) {
    const stock = await this.findOne(id);
    stock.quantity -= dto.quantity;
    if (stock.quantity < 0) {
      stock.quantity = 0;
    }
    const log = this.logRepo.create({
      entityType: Types.STOCK,
      action: Actions.REMOVE,
      reason: dto.reason,
      quantity: dto.quantity,
      stock: stock,
      timestamp: new Date().toISOString(),
    });
    await this.logRepo.save(log);
    console.log(log);
    console.log(stock);
    return await this.stockRepository.save(stock);
  }
  async addToStock(id: number, dto: UpdateStockDto) {
    const stock = await this.findOne(id);
    stock.quantity += dto.quantity;

    const log = this.logRepo.create({
      entityType: Types.STOCK,
      action: Actions.ADD,
      reason: dto.reason,
      quantity: dto.quantity,
      stock: stock,
      timestamp: new Date().toISOString(),
    });
    await this.logRepo.save(log);

    return this.stockRepository.save(stock);
  }
  async getExpiredStock() {
    const stocks = await this.stockRepository.find({
      where: {
        batch: { expirationDate: LessThan(new Date().toISOString()) },
      },
      relations: ['batch'],
    });
    return stocks;
  }
}
