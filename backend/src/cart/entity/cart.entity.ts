import { Entity, Column, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseModel } from '../../common/entity/base.entity';
import type { UserModel } from '../../user/entity/user.entity';
import { CartItemEntity } from './cart-item.entity';

@Entity('carts')
export class CartEntity extends BaseModel {
  @Column({ name: 'user_id', unique: true })
  userId: number;

  @OneToOne('UserModel')
  @JoinColumn({ name: 'user_id' })
  user: UserModel;

  @OneToMany(() => CartItemEntity, (item) => item.cart, { cascade: true })
  items: CartItemEntity[];
}
