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
    if (search) {
      const [clients, total] = await this.clientRepository.findAndCount({
        where: [
          { name: ILike(`%${search}%`) },
          { email: ILike(`%${search}%`) },
          { phone: ILike(`%${search}%`) },
          { address: ILike(`%${search}%`) },
        ],
        take: limit,
        skip: (page - 1) * limit,
        relations: ['sales', 'sales.credit'],
      });
      return {
        data: clients,
        meta: { total, page, limit, pages: Math.ceil(total / limit) },
      };
    }
    const [clients, total] = await this.clientRepository.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
    });
    return {
      data: clients,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const client = this.clientRepository.findOne({
      where: { id },
      relations: ['sales'],
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
