import { Entity, Column, ManyToOne, OneToMany, OneToOne, JoinColumn, Index } from 'typeorm';
import { BaseModel } from '../../common/entity/base.entity';
import type { UserModel } from '../../user/entity/user.entity';
import { OrderItemEntity } from './order-item.entity';
import type { PaymentEntity } from '../../payment/entity/payment.entity';

export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAID = 'paid',
  PREPARING = 'preparing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('orders')
export class OrderEntity extends BaseModel {
  @Column({ name: 'order_number', unique: true })
  @Index()
  orderNumber: string;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne('UserModel')
  @JoinColumn({ name: 'user_id' })
  user: UserModel;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING_PAYMENT })
  status: OrderStatus;

  @Column('decimal', { precision: 12, scale: 2, name: 'total_amount' })
  totalAmount: number;

  @Column({ type: 'text', name: 'shipping_address' })
  shippingAddress: string;

  @Column({ name: 'recipient_name' })
  recipientName: string;

  @Column({ name: 'recipient_phone' })
  recipientPhone: string;

  @Column({ type: 'text', nullable: true })
  memo: string | null;

  @Column({ nullable: true, name: 'paid_at' })
  paidAt: Date | null;

  @Column({ nullable: true, name: 'cancelled_at' })
  cancelledAt: Date | null;

  @Column({ type: 'text', nullable: true, name: 'cancellation_reason' })
  cancellationReason: string | null;

  @OneToMany(() => OrderItemEntity, (item) => item.order, { cascade: true })
  items: OrderItemEntity[];

  @OneToOne('PaymentEntity', 'order')
  payment: PaymentEntity;
}
