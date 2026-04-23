import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStockPaymentDto } from './dto/create-stock-payment.dto';
import { UpdateStockPaymentDto } from './dto/update-stock-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';
import { StockPayment } from './entities/stock-payment.entity';
import { Supplier } from 'src/supplier/entities/supplier.entity';
import { Batch } from 'src/batch/entities/batch.entity';
import { Log } from 'src/logs/entities/log.entity';
import { Actions, Reasons, Types } from 'utils/actions';
import { Stock } from 'src/stock/entities/stock.entity';
import { PurchasedItem } from 'src/purchased-item/entities/purchased-item.entity';
import { Credit } from 'src/credit/entities/credit.entity';

@Injectable()
export class StockPaymentService {
  constructor(
    @InjectRepository(StockPayment)
    private stockPaymentRepository: Repository<StockPayment>,
    private readonly datasource: DataSource,
  ) {}
  async create(createStockPaymentDto: CreateStockPaymentDto) {
    return await this.datasource.transaction(async (manager) => {
      const supplierRepo = manager.getRepository(Supplier);
      const batchRepo = manager.getRepository(Batch);
      const stockRepo = manager.getRepository(Stock);
      const purchasedItemRepo = manager.getRepository(PurchasedItem);
      const logRepo = manager.getRepository(Log);
      const creditRepo = manager.getRepository(Credit);
      const supplier = await supplierRepo.findOne({
        where: { id: createStockPaymentDto.supplierId },
      });
      if (!supplier) throw new NotFoundException('Supplier not found');

      const stockPayment = this.stockPaymentRepository.create({
        ...createStockPaymentDto,
        supplier,
      });
      const savedPayment = await this.stockPaymentRepository.save(stockPayment);
      let stock: Stock = new Stock();
      for (const purchasedItem of createStockPaymentDto.purchasedItems) {
        const batch = await batchRepo.findOne({
          where: { id: purchasedItem.batchId },
          relations: ['variant', 'stock'],
        });

        if (!batch) throw new NotFoundException('Batch not found');
        const purchasedItemEntity = purchasedItemRepo.create({
          batch,
          quantity: purchasedItem.quantity,
          total: purchasedItem.quantity * batch.variant.sellingPriceTTC,
          stockPayment: savedPayment,
        });
        stock = batch.stock;
        stock.quantity += purchasedItem.quantity;
        await stockRepo.update({ id: stock.id }, { quantity: stock.quantity });
        await purchasedItemRepo.save(purchasedItemEntity);
      }
      if (createStockPaymentDto.remaining !== 0) {
        const credit = creditRepo.create({
          amount: createStockPaymentDto.remaining,
          stockPayment: savedPayment,
        });
        const savedCredit = await creditRepo.save(credit);
        console.log('reached');
        savedPayment.credit = savedCredit;

        const log = logRepo.create({
          entityType: Types.CREDIT,
          action: Actions.NEW_CREDIT,
          timestamp: new Date().toISOString(),
          credit: savedCredit,
        });
        await this.stockPaymentRepository.save(savedPayment);
        await logRepo.save(log);
      }
      const stockLog = logRepo.create({
        action: Actions.ADD,
        entityType: Types.STOCK,
        reason: Reasons.REFILL,
        stock,
        timestamp: new Date().toISOString(),
      });
      await logRepo.save(stockLog);
      return savedPayment;
    });
  }

  async findAll(page: number, limit: number, search: string) {
    if (search) {
      const [items, count] = await this.stockPaymentRepository.findAndCount({
        where: { supplier: { name: `${ILike(search)}` } },
        take: limit,
        skip: (page - 1) * limit,
      });

      return {
        data: items,
        meta: { total: count, page, limit, pages: Math.ceil(count / limit) },
      };
    }
    const [items, count] = await this.stockPaymentRepository.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
    });
    return {
      data: items,
      meta: { total: count, page, limit, pages: Math.ceil(count / limit) },
    };
  }

  async findOne(id: number) {
    const stockPayment = await this.stockPaymentRepository.findOne({
      where: { id },
    });
    if (!stockPayment) throw new NotFoundException('Stock payment not found');
    return stockPayment;
  }

  async update(id: number, updateStockPaymentDto: UpdateStockPaymentDto) {
    const stockPayment = await this.stockPaymentRepository.preload({
      id,
      ...updateStockPaymentDto,
    });
    if (!stockPayment) throw new NotFoundException('Stock payment not found');
    return await this.stockPaymentRepository.save(stockPayment);
  }

  async remove(id: number) {
    const stockPayment = await this.findOne(id);
    return await this.stockPaymentRepository.remove(stockPayment);
  }
}
