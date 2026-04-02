import { Injectable, NotFoundException } from '@nestjs/common';

import { UpdateBatchDto } from './dto/update-batch.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';
import { Batch } from './entities/batch.entity';
import { CreateBatchDto } from './dto/create-batch.dto';
import { Stock } from 'src/stock/entities/stock.entity';

@Injectable()
export class BatchService {
  constructor(
    @InjectRepository(Batch) private batchRepository: Repository<Batch>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createBatchDto: CreateBatchDto) {
    return this.dataSource.transaction(async (manager) => {
      const batchRepo = manager.getRepository(Batch);
      const stockRepo = manager.getRepository(Stock);
      const batch = batchRepo.create(createBatchDto);
      const savedBatch = await batchRepo.save(batch);
      const stock = stockRepo.create({
        quantity: createBatchDto.quantity,
        batch: savedBatch,
      });
      await stockRepo.save(stock);
      savedBatch.stock = stock;
      await batchRepo.save(savedBatch);
      return savedBatch;
    });
  }

  async findAll(page: number, limit: number, search?: string) {
    console.log(search);
    if (search) {
      const [items, total] = await this.batchRepository.findAndCount({
        where: { variant: { name: ILike(`%${search}%`) } },
        take: limit,
        skip: (page - 1) * limit,
        relations: ['stock', 'variant'],
      });
      return {
        data: items,
        meta: { total, page, limit, pages: Math.ceil(total / limit) },
      };
    }
    const [items, total] = await this.batchRepository.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
      relations: ['stock', 'variant'],
    });
    return {
      data: items,

      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  async verifyExpiry() {
    // Fetch all batches to verify their expiry status
    const batches = await this.batchRepository.find();

    for (const batch of batches) {
      if (!batch.expirationDate) {
        batch.status = 'ok';
      } else {
        const now = new Date();
        const expiration = new Date(batch.expirationDate);
        // Define expiring period in days (e.g., less than 7 days to expire)
        const expiringThreshold = batch.alertPeriodPerDay ?? 7;

        // Calculate difference in days between expiration and now
        const diffTime = expiration.getTime() - now.getTime();
        const diffDays = diffTime / (1000 * 3600 * 24);

        if (diffDays < 0) {
          batch.status = 'expired';
        } else if (diffDays <= expiringThreshold) {
          batch.status = 'expiring';
        } else {
          batch.status = 'ok';
        }
      }
      await this.batchRepository.save(batch);
    }
    return { message: 'Batch expiry verification completed.' };
  }
  async getExpiredBatches(page: number, limit: number) {
    const [items, total] = await this.batchRepository.findAndCount({
      where: { status: 'expired' },
      relations: ['stock', 'variant'],
      take: limit,
      skip: (page - 1) * limit,
    });
    return {
      data: items,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  async getExpiringBatches(page: number, limit: number) {
    const [items, total] = await this.batchRepository.findAndCount({
      where: { status: 'expiring' },
      relations: ['stock', 'variant'],
      take: limit,
      skip: (page - 1) * limit,
    });
    return {
      data: items,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }
  async findOne(id: number) {
    const batch = await this.batchRepository.findOne({
      where: { id },
      relations: ['stock', 'supplier'],
    });
    if (!batch) {
      throw new NotFoundException('Batch not found');
    }
    return batch;
  }

  async update(id: number, updateBatchDto: UpdateBatchDto) {
    const batch = await this.batchRepository.preload({
      id,
      ...updateBatchDto,
    });
    if (!batch) {
      throw new NotFoundException('Batch not found');
    }
    return this.batchRepository.save(batch);
  }

  async remove(id: number) {
    const batch = await this.findOne(id);
    return await this.batchRepository.remove(batch);
  }

  async getBatchByProductId(id: number) {
    const batch = await this.batchRepository.findOne({
      where: { variant: { product: { id } } },
      relations: ['supplier', 'stock'],
    });
    if (!batch) {
      throw new NotFoundException('Batch not found');
    }
    return batch;
  }
}
