import { Batch } from 'src/batch/entities/batch.entity';
import { Product } from 'src/product/entities/product.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class ProductVariant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  PPA: string;

  @Column({ default: 0 })
  purchasePrice: number;

  @Column({ default: 0 })
  sellingPriceHT: number;

  @Column({ default: 9 })
  vatRate: number;

  @Column({ default: 0 })
  sellingPriceTTC: number;

  @Column({ default: 0 })
  profit: number;

  @Column({ default: 0 })
  profitRate: number;

  @Column({ default: 0, nullable: true })
  promotionPrice: number;

  @Column({ default: 0, nullable: true })
  promotionRate: number;

  @Column({ unique: true })
  barcode: string;

  @Column({ nullable: true })
  size: string;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true })
  weight: number;

  @Column({ nullable: true })
  height: number;

  @Column({ nullable: true })
  flavor: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  product: Product;

  @OneToMany(() => Batch, (batches) => batches.variant, {
    nullable: true,
  })
  batches: Batch[];
}
