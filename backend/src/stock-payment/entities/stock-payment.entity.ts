import { Batch } from 'src/batch/entities/batch.entity';
import { Credit } from 'src/credit/entities/credit.entity';
import { PurchasedItem } from 'src/purchased-item/entities/purchased-item.entity';
import { Supplier } from 'src/supplier/entities/supplier.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';

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
  @Column({ nullable: true })
  timbre: number;

  @ManyToOne(() => Supplier, (supplier) => supplier.stockPayments)
  supplier: Supplier;
  @OneToMany(
    () => PurchasedItem,
    (purchasedItem) => purchasedItem.stockPayment,
    {
      onDelete: 'CASCADE',
    },
  )
  purchasedItems: PurchasedItem[];

  @OneToOne(() => Credit, (credit) => credit.stockPayment, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  credit: Credit;
}
