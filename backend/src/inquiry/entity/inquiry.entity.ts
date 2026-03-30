import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseModel } from '../../common/entity/base.entity';
import type { UserModel } from '../../user/entity/user.entity';
import type { ProductEntity } from '../../product/entity/product.entity';
import type { SellerEntity } from '../../seller/entity/seller.entity';

export enum InquiryStatus {
  WAITING = 'waiting',
  ANSWERED = 'answered',
}

@Entity('inquiries')
export class InquiryEntity extends BaseModel {
  @Column({ name: 'user_id' })
  @Index()
  userId: number;

  @ManyToOne('UserModel')
  @JoinColumn({ name: 'user_id' })
  user: UserModel;

  @Column({ name: 'product_id' })
  @Index()
  productId: number;

  @ManyToOne('ProductEntity')
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @Column({ name: 'seller_id' })
  @Index()
  sellerId: number;

  @ManyToOne('SellerEntity')
  @JoinColumn({ name: 'seller_id' })
  seller: SellerEntity;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  answer: string | null;

  @Column({ type: 'timestamptz', nullable: true, name: 'answered_at' })
  answeredAt: Date | null;

  @Column({ default: false, name: 'is_secret' })
  isSecret: boolean;

  @Column({
    type: 'enum',
    enum: InquiryStatus,
    default: InquiryStatus.WAITING,
  })
  status: InquiryStatus;
}
