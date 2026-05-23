import { Log } from 'src/logs/entities/log.entity';
import { Sale } from 'src/sale/entities/sale.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Client {
  @PrimaryGeneratedColumn()
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

  @OneToMany(() => Log, (log) => log.client, { nullable: true })
  logs: Log[];

  @OneToMany(() => Sale, (sale) => sale.client, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  sales: Sale[];
  @BeforeInsert()
  @BeforeUpdate()
  setTimestamps() {
    const now = new Date().toISOString();
    if (!this.createdAt) {
      this.createdAt = now;
    }
    this.updatedAt = now;
  }
}
