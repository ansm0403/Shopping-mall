import { IsArray, IsNotEmpty, IsOptional, IsString, ArrayMinSize } from 'class-validator';

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty({ each: true })
  cartItemIds: number[];

  @IsNotEmpty()
  @IsString()
  shippingAddress: string;

  @IsNotEmpty()
  @IsString()
  recipientName: string;

  @IsNotEmpty()
  @IsString()
  recipientPhone: string;

  @IsOptional()
  @IsString()
  memo?: string;
}
