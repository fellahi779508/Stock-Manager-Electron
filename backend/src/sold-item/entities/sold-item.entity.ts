import { Batch } from 'src/batch/entities/batch.entity';
import { Sale } from 'src/sale/entities/sale.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SoldItem {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  quantity: number;
  @Column()
  total: number;
  @Column()
  sellingPrice: number;
  @ManyToOne(() => Batch, (batch) => batch.soldItems, { onDelete: 'CASCADE' })
  batch: Batch;

  @ManyToOne(() => Sale, (sale) => sale.soldItems, { onDelete: 'CASCADE' })
  sale: Sale;
}
