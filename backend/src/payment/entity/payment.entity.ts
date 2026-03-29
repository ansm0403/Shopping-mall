import { Entity, Column, OneToOne, JoinColumn, Index } from 'typeorm';
import { BaseModel } from '../../common/entity/base.entity';
import { OrderEntity } from '../../order/entity/order.entity';

export enum PaymentStatus {
  READY = 'ready',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  PARTIAL_CANCELLED = 'partial_cancelled',
  FAILED = 'failed',
}

@Entity('payments')
export class PaymentEntity extends BaseModel {
  @Column({ name: 'order_id', unique: true })
  orderId: number;

  @OneToOne(() => OrderEntity, (order) => order.payment)
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  @Column({ name: 'imp_uid', nullable: true, unique: true })
  @Index()
  impUid: string | null;

  @Column({ name: 'merchant_uid', unique: true })
  @Index()
  merchantUid: string;

  @Column({ nullable: true, name: 'payment_method' })
  paymentMethod: string | null;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.READY })
  status: PaymentStatus;

  @Column({ nullable: true, name: 'pg_provider' })
  pgProvider: string | null;

  @Column({ nullable: true, name: 'receipt_url' })
  receiptUrl: string | null;

  @Column({ nullable: true, name: 'paid_at' })
  paidAt: Date | null;

  @Column({ nullable: true, name: 'cancelled_at' })
  cancelledAt: Date | null;

  @Column('decimal', { precision: 12, scale: 2, default: 0, name: 'cancel_amount' })
  cancelAmount: number;

  @Column({ type: 'text', nullable: true, name: 'cancel_reason' })
  cancelReason: string | null;

  @Column({ type: 'jsonb', nullable: true, name: 'raw_response' })
  rawResponse: Record<string, any> | null;
}
