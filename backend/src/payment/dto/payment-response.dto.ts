import { Expose } from 'class-transformer';

export class PaymentResponseDto {
  @Expose() id: number;
  @Expose() orderId: number;
  @Expose() impUid: string | null;
  @Expose() merchantUid: string;
  @Expose() paymentMethod: string | null;
  @Expose() amount: number;
  @Expose() status: string;
  @Expose() pgProvider: string | null;
  @Expose() receiptUrl: string | null;
  @Expose() paidAt: Date | null;
  @Expose() cancelledAt: Date | null;
  @Expose() cancelAmount: number;
  @Expose() cancelReason: string | null;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;
}
