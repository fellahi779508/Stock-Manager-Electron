import { Transform } from 'class-transformer';
import { IsDateString, IsNumber, IsOptional } from 'class-validator';

export class CreateBatchDto {
  @IsDateString()
  createdAt: string;
  @IsDateString()
  updatedAt: string;

  @IsDateString()
  @IsOptional()
  fabricationDate?: string;
  @IsDateString()
  @IsOptional()
  expirationDate?: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  @IsOptional()
  purchasePrice: number;
  @IsNumber()
  @IsOptional()
  sellingPriceHT?: number;

  @IsNumber()
  sellingPriceTTC: number;

  @IsNumber()
  @IsOptional()
  vatRate?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (value === 0 ? undefined : value))
  alertPeriodPerDay?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (value === 0 ? undefined : value))
  alertPeriodPerStock?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (value === 0 ? undefined : value))
  promotionPrice?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (value === 0 ? undefined : value))
  supplierId?: number;
}
