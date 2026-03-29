import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseModel } from '../../common/entity/base.entity';
import { OrderEntity } from './order.entity';

@Entity('order_items')
export class OrderItemEntity extends BaseModel {
  @Column({ name: 'order_id' })
  orderId: number;

  @ManyToOne(() => OrderEntity, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ name: 'seller_id' })
  sellerId: number;

  // ── 스냅샷 필드 (주문 시점 가격/이름 보존) ──

  @Column({ name: 'product_name' })
  productName: string;

  @Column('decimal', { precision: 10, scale: 2, name: 'product_price' })
  productPrice: number;

  @Column({ nullable: true, name: 'product_image_url' })
  productImageUrl: string | null;

  @Column({ type: 'int' })
  quantity: number;

  @Column('decimal', { precision: 12, scale: 2 })
  subtotal: number;
}
