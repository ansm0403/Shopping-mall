import { ReviewEntity } from '../../review/entity/review.entity';
import { WishListEntity } from '../../wish-list/entity/wishList.entity';
import { BaseModel } from '../../common/entity/base.entity';
import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';

export enum ProductCategory {
  BEAUTY = 'BEAUTY',
  CLOTHING = 'CLOTHING',
  FOOD = 'FOOD',
  BOOK = 'BOOK',
  LIVING = 'LIVING',
  SHOES = 'SHOES',
}

@Entity('products')
export class ProductEntity extends BaseModel{
  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({
    type: 'enum',
    enum: ProductCategory,
  })
  category: ProductCategory;

  @Column()
  imageUrl: string;

  @Column()
  brand: string;

  @Column()
  isEvent: boolean;

  @Column()
  discountRate: number;

  @Column({ nullable: true })
  rating?: number;

  @OneToMany(() => ReviewEntity, (review) => review.product)
  reviews: ReviewEntity[];

  @ManyToOne(() => WishListEntity, (wishList) => wishList.products)
  @JoinColumn()
  wishList: WishListEntity;
}
