import { Log } from 'src/logs/entities/log.entity';
import { Sale } from 'src/sale/entities/sale.entity';
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

  @OneToMany(() => Log, (log) => log.credit)
  logs: Log[];

  @OneToOne(() => Sale, (sale) => sale.credit, { cascade: true })
  @JoinColumn({ name: 'sale_id' })
  sale: Sale;
}
