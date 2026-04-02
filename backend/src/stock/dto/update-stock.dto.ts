import { PartialType } from '@nestjs/mapped-types';
import { CreateStockDto } from './create-stock.dto';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { Reasons } from 'utils/actions';

export class UpdateStockDto extends PartialType(CreateStockDto) {
  @IsString()
  reason: string;
  @IsNumber()
  quantity: number;
}
