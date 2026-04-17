import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateStockPaymentDto {
  @IsNumber()
  amount: number;
  @IsNumber()
  total: number;
  @IsNumber()
  remaining: number;
  @IsDateString()
  date: string;
  @IsNumber()
  supplierId: number;
  @IsString()
  paymentMethod: string;
  @IsNumber()
  @IsOptional()
  timbre?: number;
  @IsArray()
  purchasedItems: {
    batchId: number;
    quantity: number;
  }[];
}
