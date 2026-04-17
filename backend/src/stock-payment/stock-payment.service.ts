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

@Injectable()
export class StockPaymentService {
  constructor(
    @InjectRepository(StockPayment)
    private stockPaymentRepository: Repository<StockPayment>,
    private readonly datasource: DataSource,
  ) {}
  async create(createStockPaymentDto: CreateStockPaymentDto) {
    const supplierRepo = this.datasource.getRepository(Supplier);
    const batchRepo = this.datasource.getRepository(Batch);
    const stockRepo = this.datasource.getRepository(Stock);
    const purchasedItemRepo = this.datasource.getRepository(PurchasedItem);
    const logRepo = this.datasource.getRepository(Log);
    const supplier = await supplierRepo.findOne({
      where: { id: createStockPaymentDto.supplierId },
    });
    if (!supplier) throw new NotFoundException('Supplier not found');

    const stockPayment = this.stockPaymentRepository.create(
      createStockPaymentDto,
    );
    stockPayment.supplier = supplier;
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
      await stockRepo.save(stock);
      await purchasedItemRepo.save(purchasedItemEntity);
    }
    const log = logRepo.create({
      action: Actions.NEW_CREDIT,
      entityType: 'stock_payment',
      timestamp: new Date().toISOString(),
      supplier,
    });
    const stockLog = logRepo.create({
      action: Actions.ADD,
      entityType: Types.STOCK,
      reason: Reasons.REFILL,
      stock,
      timestamp: new Date().toISOString(),
    });
    await logRepo.save(log);
    await logRepo.save(stockLog);
    return savedPayment;
  }

  async findAll(page: number, limit: number, search: string) {
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
