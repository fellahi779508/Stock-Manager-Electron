import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { OwnerService } from './owner.service';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';

@Controller('owner')
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @Post()
  create(@Body() createOwnerDto: CreateOwnerDto) {
    return this.ownerService.create(createOwnerDto);
  }

  @Get()
  findOne() {
    return this.ownerService.getOwner();
  }
  @Get('todayProfit')
  todayProfit() {
    return this.ownerService.getProfitsFromSalesOfTheDay();
  }
  @Get('todaySales')
  todaySales() {
    return this.ownerService.getSalesOfTheDay();
  }
  @Get('todayLosses')
  todayLoses() {
    return this.ownerService.getLossesOfTheDay();
  }
  @Get('todayCosts')
  todayCosts() {
    return this.ownerService.getCostesOfTheDay();
  }
  @Get('todayPurchases')
  todayPurchases() {
    return this.ownerService.getPurchasesOfTheDay();
  }

  @Put()
  update(@Body() updateOwnerDto: UpdateOwnerDto) {
    return this.ownerService.update(updateOwnerDto);
  }
}
