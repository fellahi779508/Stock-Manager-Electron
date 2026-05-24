import { Injectable } from '@nestjs/common';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Owner } from './entities/owner.entity';
import { Batch, DataSource, ILike, Repository } from 'typeorm';
import { Sale } from 'src/sale/entities/sale.entity';
import { Log } from 'src/logs/entities/log.entity';
import { Reasons, Types } from 'utils/actions';
import { PurchasedItem } from 'src/purchased-item/entities/purchased-item.entity';
import { StockPayment } from 'src/stock-payment/entities/stock-payment.entity';
import { Credit } from 'src/credit/entities/credit.entity';

@Injectable()
export class OwnerService {
  constructor(
    @InjectRepository(Owner) private ownerRepository: Repository<Owner>,
    private readonly dataSource: DataSource,
  ) {}
  async create(createOwnerDto: CreateOwnerDto) {
    const owner = this.ownerRepository.create(createOwnerDto);
    return await this.ownerRepository.save(owner);
  }

  getOwner() {
    return this.ownerRepository.findOne({ where: { id: 1 } });
  }

  async update(updateOwnerDto: UpdateOwnerDto) {
    const owner = await this.ownerRepository.preload({
      ...updateOwnerDto,
      id: 1,
    });
    if (!owner) {
      throw new Error('Owner not found');
    }
    return await this.ownerRepository.save(owner);
  }

  async getProfitsFromSalesOfTheDay() {
    const today = new Date().toISOString().split('T')[0];
    const saleRepo = this.dataSource.getRepository(Sale);
    const creditRepo = this.dataSource.getRepository(Credit);
    const sales = await saleRepo.find({
      where: {
        date: ILike(`${today}%`),
      },
      relations: ['soldItems', 'soldItems.batch', 'soldItems.batch.variant'],
    });

    let totalSaleProfit = 0;
    for (const sale of sales) {
      for (const item of sale.soldItems) {
        const baseProfit = item.sellingPrice - item.batch.variant.purchasePrice;
        const total = baseProfit * item.quantity;
        totalSaleProfit += total;
      }
    }
    return { total: totalSaleProfit, data: sales };
  }
  async getSalesOfTheDay() {
    const today = new Date().toISOString().split('T')[0];
    const saleRepo = this.dataSource.getRepository(Sale);

    const sales = await saleRepo.find({
      where: {
        date: ILike(`%${today}%`),
      },
      relations: ['soldItems', 'soldItems.batch', 'soldItems.batch.variant'],
      take: 3,
      order: {
        id: 'DESC',
      },
    });

    return sales;
  }
  async getPurchasesOfTheDay() {
    const today = new Date().toISOString().split('T')[0];
    const purchaseRepo = this.dataSource.getRepository(StockPayment);

    const purchases = await purchaseRepo.find({
      where: {
        date: ILike(`%${today}%`),
      },
      relations: [
        'purchasedItems',
        'purchasedItems.batch',
        'purchasedItems.batch.variant',
        'supplier',
      ],
      select: {
        supplier: {
          id: true,
          name: true,
          phone: true,
          email: true,
        },
        purchasedItems: {
          id: true,
          quantity: true,
          total: true,
          batch: {
            id: true,
            variant: {
              id: true,
              name: true,
              purchasePrice: true,
            },
          },
        },
      },
      take: 3,
      order: {
        id: 'DESC',
      },
    });

    return purchases;
  }
  async getLossesOfTheDay() {
    const today = new Date().toISOString().split('T')[0];
    const logRepo = this.dataSource.getRepository(Log);
    const bacthRepo = this.dataSource.getRepository(Batch);
    let logs = await logRepo.find({
      where: [
        {
          entityType: Types.STOCK,
          reason: Reasons.EXPIRED,
          timestamp: ILike(`%${today}%`),
        },
        {
          entityType: Types.STOCK,
          reason: Reasons.DAMAGED,
          timestamp: ILike(`%${today}%`),
        },
      ],
      relations: ['stock', 'stock.batch', 'stock.batch.variant'],
      select: {
        stock: {
          id: true,
          quantity: true,
          batch: { id: true, variant: { purchasePrice: true } },
        },
      },
    });

    let sum = 0;
    for (const log of logs) {
      sum += log.quantity * log.stock.batch.variant.purchasePrice;
    }
    return { totalLoss: sum, data: logs };
  }
  async getCostesOfTheDay() {
    const today = new Date().toISOString().split('T')[0];
    const purchaseRepo = this.dataSource.getRepository(StockPayment);
    const purchases = await purchaseRepo.find({
      where: {
        date: ILike(`%${today}%`),
      },
      relations: ['supplier'],
    });
    let totalCost = 0;
    let totalCredit = 0;
    for (const purchase of purchases) {
      totalCost += purchase.amount;
      totalCredit += purchase.remaining;
    }
    return { totalCost, totalCredit, data: purchases };
  }
}
