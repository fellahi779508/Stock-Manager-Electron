import { IsDateString, IsNumber } from 'class-validator';

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
  @IsNumber()
  batchId: number;
}
