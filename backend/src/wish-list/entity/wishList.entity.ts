import { BaseModel } from '../../common/entity/base.entity';
import { Entity, Column, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import type { UserModel } from '../../user/entity/user.entity';
import type { ProductEntity } from '../../product/entity/product.entity';

@Entity('wish_list_items')
@Unique(['userId', 'productId'])
export class WishListItemEntity extends BaseModel {
  @Column({ name: 'user_id' })
  @Index()
  userId: number;

  @ManyToOne('UserModel')
  @JoinColumn({ name: 'user_id' })
  user: UserModel;

  @Column({ name: 'product_id' })
  productId: number;

  @ManyToOne('ProductEntity')
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;
}
