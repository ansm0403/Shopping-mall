import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AddCartItemDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  productId: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}
