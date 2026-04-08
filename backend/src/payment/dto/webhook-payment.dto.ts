import { IsNotEmpty, IsObject, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class WebhookDataDto {
  @IsNotEmpty()
  @IsString()
  paymentId: string;

  @IsString()
  transactionId?: string;
}

/**
 * 포트원 V2 웹훅 페이로드
 * 참고: https://developers.portone.io/docs/ko/v2-payment/webhook
 *
 * type 예시:
 *   Transaction.Paid         — 결제 완료
 *   Transaction.Cancelled    — 결제 취소
 *   Transaction.Failed       — 결제 실패
 *   Transaction.PayPending   — 결제 대기 (가상계좌 등)
 */
export class WebhookPaymentDto {
  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => WebhookDataDto)
  data: WebhookDataDto;
}
