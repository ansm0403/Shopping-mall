import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyPaymentDto {
  /** 포트원 V2가 발급한 거래 ID (프론트 response.transactionId) */
  @IsNotEmpty()
  @IsString()
  transactionId: string;

  /** 우리가 설정한 결제 ID (= orderNumber) */
  @IsNotEmpty()
  @IsString()
  paymentId: string;
}
