import { Batch } from 'src/batch/entities/batch.entity';
import { Log } from 'src/logs/entities/log.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Stock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantity: number;

  @Column()
  createdAt: string;

  @Column()
  updatedAt: string;

  @OneToOne(() => Batch, (batch) => batch.stock, { onDelete: 'CASCADE' })
  batch: Batch;

  @OneToMany(() => Log, (log) => log.stock)
  logs: Log[];
}
