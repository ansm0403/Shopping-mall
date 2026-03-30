import { IsNotEmpty, IsString } from 'class-validator';

export class ShipOrderDto {
  @IsNotEmpty()
  @IsString()
  trackingNumber: string;

  @IsNotEmpty()
  @IsString()
  carrier: string;
}
