import { IsArray, IsDateString, IsNumber, IsOptional } from 'class-validator';

export class CreateSaleDto {
  @IsNumber()
  total: number;

  @IsNumber()
  @IsOptional()
  clientId?: number;

  @IsNumber()
  paid: number;

  @IsDateString()
  date: string;

  @IsArray()
  soldItems: {
    batchId: number;
    quantity: number;
  }[];
}
