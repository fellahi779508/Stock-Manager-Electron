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
  alertPeriodPerDay?: number;

  @IsNumber()
  @IsOptional()
  promotionPrice?: number;

  @IsNumber()
  @IsOptional()
  supplierId?: number;
}
