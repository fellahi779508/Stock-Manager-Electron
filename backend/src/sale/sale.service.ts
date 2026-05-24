import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { Credit } from 'src/credit/entities/credit.entity';
import { Log } from 'src/logs/entities/log.entity';
import { StockService } from 'src/stock/stock.service';
import { Client } from 'src/client/entities/client.entity';
import { Actions, Reasons, Types } from 'utils/actions';
import { Stock } from 'src/stock/entities/stock.entity';
import { Batch } from 'src/batch/entities/batch.entity';
import { SoldItem } from 'src/sold-item/entities/sold-item.entity';
import { BatchService } from 'src/batch/batch.service';

@Injectable()
export class SaleService {
  constructor(
    @InjectRepository(Sale) private saleRepository: Repository<Sale>,
    private readonly datasource: DataSource,
    private readonly stockService: StockService,
    private readonly batchService: BatchService,
  ) {}
  async create(createSaleDto: CreateSaleDto) {
    return this.datasource.transaction(async (manager) => {
      const bacthRepo = manager.getRepository(Batch);
      const stockRepo = manager.getRepository(Stock);
      const saleRepo = manager.getRepository(Sale);
      const clientRepo = manager.getRepository(Client);
      const creditRepo = manager.getRepository(Credit);
      const logRepo = manager.getRepository(Log);
      const soldItemRepo = manager.getRepository(SoldItem);

      const sale = saleRepo.create(createSaleDto);
      if (createSaleDto.clientId) {
        const client = await clientRepo.findOne({
          where: { id: createSaleDto.clientId },
        });
        if (!client) throw new NotFoundException('Client not found');
        sale.client = client;
      }
      const savedSale = await saleRepo.save(sale);
      for (const item of createSaleDto.soldItems) {
        const batch = await bacthRepo.findOne({
          where: { id: item.batchId },
          relations: ['stock', 'variant'],
        });
        if (!batch) throw new NotFoundException('Batch not found');
        const soldItem = soldItemRepo.create({
          quantity: item.quantity,
          total: item.quantity * batch.variant.sellingPriceTTC,
          batch,
          sale: savedSale,
          sellingPrice: item.sellingPrice,
        });
        await soldItemRepo.save(soldItem);
        const stock = await this.stockService.findOne(batch.stock.id);
        stock.quantity -= item.quantity;
        await stockRepo.save(stock);
        const stockLog = logRepo.create({
          entityType: Types.STOCK,
          action: Actions.REMOVE,
          reason: Reasons.SOLD,
          quantity: item.quantity,
          stock: stock,
          sale: { id: savedSale.id },
          timestamp: new Date().toISOString(),
        });
        await logRepo.save(stockLog);
        await this.batchService.updateBatchStatus(batch.id);
      }
      if (createSaleDto.total !== createSaleDto.paid) {
        const credit = creditRepo.create({
          amount: createSaleDto.total - createSaleDto.paid,
          sale: savedSale,
          date: new Date().toISOString(),
        });
        await creditRepo.save(credit);
        const creditLog = logRepo.create({
          action: Actions.NEW_CREDIT,
          credit: credit,
          entityType: Types.CREDIT,
          sale: savedSale,
          timestamp: new Date().toISOString(),
        });
        await logRepo.save(creditLog);
      }
      const saleLog = logRepo.create({
        action: Actions.NEW_SALE,
        sale: savedSale,
        entityType: Types.SALE,
        timestamp: new Date().toISOString(),
      });

      await logRepo.save(saleLog);
      return savedSale;
    });
  }

  async findAll(page: number, limit: number, search?: string) {
    if (search) {
      const [items, total] = await this.saleRepository.findAndCount({
        where: { client: { name: ILike(`%${search}%`) } },
        take: limit,
        skip: (page - 1) * limit,
        relations: ['client', 'soldItems', 'soldItems.batch'],
      });
    }
    const [items, total] = await this.saleRepository.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
      relations: ['client', 'soldItems', 'soldItems.batch'],
    });
    return {
      data: items,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }
  async getTodaysSales() {
    const sales = await this.saleRepository.find({
      where: { date: ILike(`%${new Date().toISOString().split('T')[0]}%`) },
      relations: [
        'client',
        'soldItems',
        'soldItems.batch',
        'soldItems.batch.variant',
        'credit',
      ],
      order: { id: 'DESC' },
    });
    console.log(sales[0].soldItems[0]);

    return sales;
  }

  async findOne(id: number) {
    const sale = await this.saleRepository.findOne({
      where: { id },
      relations: ['client', 'soldItems', 'soldItems.batch'],
    });
    if (!sale) throw new NotFoundException('Sale not found');
    return sale;
  }

  async update(id: number, dto: UpdateSaleDto) {
    return await this.datasource.transaction(async (manager) => {
      const soldItemRepo = manager.getRepository(SoldItem);
      const creditRepo = manager.getRepository(Credit);
      const batchRepo = manager.getRepository(Batch);
      const stockRepo = manager.getRepository(Stock);
      const logRepo = manager.getRepository(Log);
    });
  }

  async remove(id: number) {
    const sale = await this.findOne(id);
    return this.saleRepository.remove(sale);
  }

  //dev only

  async cleareAll() {
    return await this.saleRepository.clear();
  }
}
