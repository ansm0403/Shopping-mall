import { BaseModel } from '../../common/entity/base.entity';
import { Column, Entity, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import type { UserModel } from '../../user/entity/user.entity';
import type { ProductEntity } from '../../product/entity/product.entity';

@Entity('reviews')
@Unique(['userId', 'productId', 'orderId'])
export class ReviewEntity extends BaseModel {
  @Column({ name: 'user_id' })
  @Index()
  userId: number;

  @ManyToOne('UserModel', 'reviews')
  @JoinColumn({ name: 'user_id' })
  user: UserModel;

  @Column({ name: 'product_id' })
  @Index()
  productId: number;

  @ManyToOne('ProductEntity', 'reviews')
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @Column({ name: 'order_id' })
  orderId: number;

  @Column({ type: 'smallint' })
  rating: number;

  @Column({ type: 'text' })
  comment: string;

  @Column('text', { array: true, default: '{}' })
  imageUrls: string[];
}
