import { Injectable } from '@nestjs/common';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Owner } from './entities/owner.entity';
import { DataSource, Repository } from 'typeorm';
import { Sale } from 'src/sale/entities/sale.entity';

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
    const sales = await saleRepo.find({
      where: {
        date: today,
      },
      relations: ['soldItems', 'soldItems.batch', 'soldItems.batch.variant'],
    });
    const profits = sales.map((sale) => {
      return sale.soldItems.reduce((acc, item) => {
        return acc + item.batch.variant.profitTTC * item.quantity;
      }, 0);
    });
    return profits.reduce((acc, profit) => acc + profit, 0);
  }
  async getSalesOfTheDay() {
    const today = new Date().toISOString().split('T')[0];
    const saleRepo = this.dataSource.getRepository(Sale);
    const sales = await saleRepo.find({
      where: {
        date: today,
      },
      relations: ['soldItems', 'soldItems.batch', 'soldItems.batch.variant'],
    });
    return sales;
  }
  async getLossesOfTheDay() {
    const today = new Date().toISOString().split('T')[0];
    const saleRepo = this.dataSource.getRepository(Sale);
    const sales = await saleRepo.find({
      where: {
        date: today,
      },
      relations: ['soldItems', 'soldItems.batch', 'soldItems.batch.variant'],
    });
  }
}
