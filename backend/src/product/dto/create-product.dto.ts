import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @IsNotEmpty()
  @IsString()
  brand: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stockQuantity?: number;

  @IsOptional()
  @IsBoolean()
  isEvent?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  discountRate?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;
}
