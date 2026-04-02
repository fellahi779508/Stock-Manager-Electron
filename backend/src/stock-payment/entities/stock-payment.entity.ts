import { Batch } from 'src/batch/entities/batch.entity';
import { Supplier } from 'src/supplier/entities/supplier.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class StockPayment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  amount: number;

  @Column()
  total: number;

  @Column()
  remaining: number;

  @Column()
  date: string;

  @Column()
  paymentMethod: string;

  @ManyToOne(() => Supplier, (supplier) => supplier.stockPayments)
  supplier: Supplier;
  @ManyToOne(() => Batch, (batch) => batch.stockPayments, {
    onDelete: 'CASCADE',
  })
  batch: Batch;
}
