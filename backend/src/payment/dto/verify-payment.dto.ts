import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyPaymentDto {
  @IsNotEmpty()
  @IsString()
  impUid: string;

  @IsNotEmpty()
  @IsString()
  merchantUid: string;
}
