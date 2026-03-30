import { Entity, Column, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { BaseModel } from '../../common/entity/base.entity';
import type { OrderEntity } from '../../order/entity/order.entity';
import type { SellerEntity } from '../../seller/entity/seller.entity';

export enum SettlementStatus {
  PENDING = 'pending',       // 구매 확정 → 자동 생성
  CONFIRMED = 'confirmed',   // Admin 정산 확정
  PAID = 'paid',             // 실제 송금 완료
}

@Entity('settlements')
@Unique(['orderId', 'sellerId'])
export class SettlementEntity extends BaseModel {
  @Column({ name: 'order_id' })
  @Index()
  orderId: number;

  @ManyToOne('OrderEntity')
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  @Column({ name: 'seller_id' })
  @Index()
  sellerId: number;

  @ManyToOne('SellerEntity')
  @JoinColumn({ name: 'seller_id' })
  seller: SellerEntity;

  @Column({ name: 'order_number' })
  @Index()
  orderNumber: string;

  // 해당 셀러의 주문 내 매출액 (OrderItems subtotal 합)
  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  // 수수료율 (기본 10%)
  @Column('decimal', { precision: 5, scale: 2, name: 'commission_rate', default: 10.0 })
  commissionRate: number;

  // 수수료 금액
  @Column('decimal', { precision: 12, scale: 2, name: 'commission_amount' })
  commissionAmount: number;

  // 실 정산액 (amount - commissionAmount)
  @Column('decimal', { precision: 12, scale: 2, name: 'settlement_amount' })
  settlementAmount: number;

  @Column({
    type: 'enum',
    enum: SettlementStatus,
    default: SettlementStatus.PENDING,
  })
  status: SettlementStatus;

  @Column({ type: 'timestamptz', nullable: true, name: 'confirmed_at' })
  confirmedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true, name: 'paid_at' })
  paidAt: Date | null;
}
