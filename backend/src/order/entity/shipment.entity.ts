import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseModel } from '../../common/entity/base.entity';
import { OrderEntity } from './order.entity';
import type { SellerEntity } from '../../seller/entity/seller.entity';

export enum ShipmentStatus {
  PREPARING = 'preparing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
}

@Entity('shipments')
@Unique(['orderId', 'sellerId'])
export class ShipmentEntity extends BaseModel {
  @Column({ name: 'order_id' })
  orderId: number;

  @ManyToOne(() => OrderEntity, (order) => order.shipments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  @Column({ name: 'seller_id' })
  sellerId: number;

  @ManyToOne('SellerEntity')
  @JoinColumn({ name: 'seller_id' })
  seller: SellerEntity;

  @Column({ type: 'enum', enum: ShipmentStatus, default: ShipmentStatus.PREPARING })
  status: ShipmentStatus;

  @Column({ nullable: true, name: 'tracking_number' })
  trackingNumber: string | null;

  @Column({ nullable: true })
  carrier: string | null;

  @Column({ type: 'timestamptz', nullable: true, name: 'shipped_at' })
  shippedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true, name: 'delivered_at' })
  deliveredAt: Date | null;
}
