import { Client } from 'src/client/entities/client.entity';
import { Credit } from 'src/credit/entities/credit.entity';
import { Log } from 'src/logs/entities/log.entity';
import { SoldItem } from 'src/sold-item/entities/sold-item.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Sale {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  total: number;

  @Column()
  paid: number;

  @Column()
  date: string;

  @Column({ default: false })
  remise: boolean;
  @Column({ default: 0 })
  remiseAmount: number;

  @OneToMany(() => Log, (log) => log.sale)
  logs: Log[];

  @OneToOne(() => Credit, (credit) => credit.sale, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  credit: Credit;

  @ManyToOne(() => Client, (client) => client.sales, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  client: Client;

  @OneToMany(() => SoldItem, (soldItem) => soldItem.sale, {
    nullable: true,
  })
  soldItems: SoldItem[];
}
