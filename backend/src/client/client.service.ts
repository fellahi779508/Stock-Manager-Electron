import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Client } from './entities/client.entity';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client) private clientRepository: Repository<Client>,
  ) {}
  create(createClientDto: CreateClientDto) {
    const client = this.clientRepository.create(createClientDto);
    return this.clientRepository.save(client);
  }

  async findAll(page: number, limit: number, search?: string) {
    const query: any = {
      where: search ? { name: ILike(`%${search}%`) } : undefined,
      skip: limit > 0 ? (page - 1) * limit : undefined,
    };

    // Only add take if limit > 0
    if (limit > 0) {
      query.take = limit;
    }

    const [items, total] = await this.clientRepository.findAndCount(query);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        pages: limit > 0 ? Math.ceil(total / limit) : 1,
      },
    };
  }

  async findOne(id: number) {
    const client = this.clientRepository.findOne({
      where: { id },
      relations: ['sales', 'sales.credit'],
    });
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    return client;
  }

  async update(id: number, updateClientDto: UpdateClientDto) {
    const client = await this.clientRepository.preload({
      id,
      ...updateClientDto,
    });
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    return await this.clientRepository.save(client);
  }

  async remove(id: number) {
    return await this.clientRepository.delete(id);
  }
}
