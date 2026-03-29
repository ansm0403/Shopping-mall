import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseModel } from '../../common/entity/base.entity';
import { CartEntity } from './cart.entity';
import type { ProductEntity } from '../../product/entity/product.entity';

@Entity('cart_items')
@Unique(['cartId', 'productId'])
export class CartItemEntity extends BaseModel {
  @Column({ name: 'cart_id' })
  cartId: number;

  @ManyToOne(() => CartEntity, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: CartEntity;

  @Column({ name: 'product_id' })
  productId: number;

  @ManyToOne('ProductEntity', { nullable: false })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @Column({ type: 'int', default: 1 })
  quantity: number;
}
