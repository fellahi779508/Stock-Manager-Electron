import { Batch } from 'src/batch/entities/batch.entity';
import { Log } from 'src/logs/entities/log.entity';
import { StockPayment } from 'src/stock-payment/entities/stock-payment.entity';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

@Entity()
export class Supplier {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column()
  createdAt: string;

  @Column()
  updatedAt: string;

  @OneToMany(() => Batch, (batches) => batches.supplier, {
    onDelete: 'SET NULL',
  })
  batches: Batch[];

  @OneToMany(() => StockPayment, (stockPayment) => stockPayment.supplier)
  stockPayments: StockPayment[];

  @OneToMany(() => Log, (log) => log.supplier)
  logs: Log[];
}
