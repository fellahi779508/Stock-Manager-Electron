import { Log } from 'src/logs/entities/log.entity';
import { Package } from 'src/package/entities/package.entity';
import { ProductVariant } from 'src/product_variant/entities/product_variant.entity';
import { PurchasedItem } from 'src/purchased-item/entities/purchased-item.entity';
import { SoldItem } from 'src/sold-item/entities/sold-item.entity';
import { StockPayment } from 'src/stock-payment/entities/stock-payment.entity';
import { Stock } from 'src/stock/entities/stock.entity';
import { Supplier } from 'src/supplier/entities/supplier.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

@Entity()
export class Batch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  createdAt: string;

  @Column()
  updatedAt: string;

  @Column({ nullable: true })
  fabricationDate: string;

  @Column({ nullable: true })
  expirationDate: string;

  @Column({ nullable: true })
  alertPeriodPerDay: number;

  @Column({ nullable: true })
  alertPeriodPerStock: number;

  @Column({ nullable: true })
  nLot: string;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  stockQTYStatus: string;

  @ManyToOne(() => ProductVariant, (variant) => variant.batches, {
    onDelete: 'CASCADE',
  })
  variant: ProductVariant;

  @OneToOne(() => Stock, (stock) => stock.batch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stock_id' })
  stock: Stock;

  @ManyToOne(() => Supplier, (supplier) => supplier.batches, {
    onDelete: 'SET NULL',
  })
  supplier: Supplier;

  @OneToMany(() => Log, (log) => log.batch, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  logs: Log[];

  @OneToMany(() => SoldItem, (soldItem) => soldItem.batch, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  soldItems: SoldItem[];
  @OneToMany(() => PurchasedItem, (purchasedItem) => purchasedItem.batch, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  purchasedItems: PurchasedItem[];

  @OneToOne(() => Package, (pack) => pack.batch, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  pack: Package;

  @BeforeInsert()
  @BeforeUpdate()
  verifyStatus() {
    const now = new Date();

    if (!this.expirationDate) {
      this.status = 'ok';
      return;
    }

    const expiration = new Date(this.expirationDate);

    if (now > expiration) {
      this.status = 'expired';
      return;
    }

    const msPerDay = 1000 * 60 * 60 * 24;
    const daysLeft = Math.floor(
      (expiration.getTime() - now.getTime()) / msPerDay,
    );

    if (daysLeft <= 0) {
      this.status = 'expired';
    } else if (
      this.alertPeriodPerDay !== null &&
      this.alertPeriodPerDay !== undefined &&
      daysLeft <= this.alertPeriodPerDay
    ) {
      this.status = 'expiring';
    } else {
      this.status = 'ok';
    }
    this.updatedAt = new Date().toISOString();
  }
  @BeforeInsert()
  @BeforeUpdate()
  verifyStockQTYStatus() {
    if (
      this.alertPeriodPerStock === null ||
      this.alertPeriodPerStock === undefined
    ) {
      this.stockQTYStatus = 'ok';
      return;
    }

    // If stock relation is not loaded, we can't verify quantity status
    if (!this.stock) {
      this.stockQTYStatus = 'ok';
      return;
    }

    const currentStockQTY = this.stock.quantity;
    console.log(currentStockQTY);

    if (currentStockQTY <= this.alertPeriodPerStock && currentStockQTY > 0) {
      this.stockQTYStatus = 'low';
      console.log('triggered verifyStockQTYStatus');
      return;
    }
    if (currentStockQTY === 0) {
      this.stockQTYStatus = 'empty';
      return;
    }
    this.stockQTYStatus = 'ok';
    this.updatedAt = new Date().toISOString();
  }
}
