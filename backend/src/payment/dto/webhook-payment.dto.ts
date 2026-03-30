import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class WebhookPaymentDto {
  @IsNotEmpty()
  @IsString()
  imp_uid: string;

  @IsNotEmpty()
  @IsString()
  merchant_uid: string;

  @IsOptional()
  @IsString()
  status?: string;
}
