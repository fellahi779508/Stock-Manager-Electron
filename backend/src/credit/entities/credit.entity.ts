import { Log } from 'src/logs/entities/log.entity';
import { Sale } from 'src/sale/entities/sale.entity';
import { StockPayment } from 'src/stock-payment/entities/stock-payment.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Credit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  amount: number;

  @OneToMany(() => Log, (log) => log.credit, {
    cascade: true,
    nullable: true,
  })
  logs: Log[];

  @OneToOne(() => Sale, (sale) => sale.credit, {
    cascade: true,
    nullable: true,
  })
  @JoinColumn({ name: 'sale_id' })
  sale: Sale;

  @OneToOne(() => StockPayment, (stockPayment) => stockPayment.credit, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'purchase_id' })
  stockPayment: StockPayment;
}
