import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { StockPaymentService } from './stock-payment.service';
import { CreateStockPaymentDto } from './dto/create-stock-payment.dto';
import { UpdateStockPaymentDto } from './dto/update-stock-payment.dto';

@Controller('stock-payment')
export class StockPaymentController {
  constructor(private readonly stockPaymentService: StockPaymentService) {}

  @Post()
  create(@Body() createStockPaymentDto: CreateStockPaymentDto) {
    return this.stockPaymentService.create(createStockPaymentDto);
  }

  @Get()
  findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
  ) {
    return this.stockPaymentService.findAll(page, limit, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockPaymentService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStockPaymentDto: UpdateStockPaymentDto,
  ) {
    return this.stockPaymentService.update(+id, updateStockPaymentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stockPaymentService.remove(+id);
  }
}
