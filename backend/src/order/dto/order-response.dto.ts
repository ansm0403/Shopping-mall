import { Expose, Type } from 'class-transformer';

class OrderItemResponseDto {
  @Expose() id: number;
  @Expose() productId: number;
  @Expose() sellerId: number;
  @Expose() productName: string;
  @Expose() productPrice: number;
  @Expose() productImageUrl: string | null;
  @Expose() quantity: number;
  @Expose() subtotal: number;
}

class PaymentSummaryDto {
  @Expose() id: number;
  @Expose() impUid: string | null;
  @Expose() merchantUid: string;
  @Expose() paymentMethod: string | null;
  @Expose() amount: number;
  @Expose() status: string;
  @Expose() pgProvider: string | null;
  @Expose() receiptUrl: string | null;
  @Expose() paidAt: Date | null;
}

export class OrderResponseDto {
  @Expose() id: number;
  @Expose() orderNumber: string;
  @Expose() userId: number;
  @Expose() status: string;
  @Expose() totalAmount: number;
  @Expose() shippingAddress: string;
  @Expose() recipientName: string;
  @Expose() recipientPhone: string;
  @Expose() memo: string | null;
  @Expose() paidAt: Date | null;
  @Expose() cancelledAt: Date | null;
  @Expose() cancellationReason: string | null;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;

  @Expose()
  @Type(() => OrderItemResponseDto)
  items: OrderItemResponseDto[];

  @Expose()
  @Type(() => PaymentSummaryDto)
  payment: PaymentSummaryDto | null;
}
