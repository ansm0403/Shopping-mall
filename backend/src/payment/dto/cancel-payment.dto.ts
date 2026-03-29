import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CancelPaymentDto {
  @IsNotEmpty()
  @IsString()
  reason: string;
}
