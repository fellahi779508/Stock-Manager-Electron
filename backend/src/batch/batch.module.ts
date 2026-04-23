import { Module } from '@nestjs/common';
import { BatchService } from './batch.service';
import { BatchController } from './batch.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Batch } from './entities/batch.entity';
import { StockModule } from 'src/stock/stock.module';

@Module({
  controllers: [BatchController],
  providers: [BatchService],
  imports: [TypeOrmModule.forFeature([Batch])],
  exports: [BatchService],
})
export class BatchModule {}
