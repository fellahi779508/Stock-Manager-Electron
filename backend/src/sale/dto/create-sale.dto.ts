import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CreateSaleDto {
  @IsNumber()
  total: number;

  @IsNumber()
  @IsOptional()
  clientId?: number;

  @IsNumber()
  paid: number;

  @IsBoolean()
  remise: boolean;

  @IsNumber()
  remiseAmount: number;

  @IsDateString()
  date: string;

  @IsArray()
  soldItems: {
    batchId: number;
    quantity: number;
    sellingPrice: number;
  }[];
}
