import { ReviewEntity } from '../../review/entity/review.entity';
import { WishListEntity } from '../../wish-list/entity/wishList.entity';
import { BaseModel } from '../../common/entity/base.entity';
import { Entity, Column, OneToMany, ManyToOne, ManyToMany, JoinTable, JoinColumn } from 'typeorm';
import { TagEntity } from './tag.entity';

export enum ProductCategory {
  BEAUTY = 'BEAUTY',
  CLOTHING = 'CLOTHING',
  FOOD = 'FOOD',
  BOOK = 'BOOK',
  LIVING = 'LIVING',
  SHOES = 'SHOES',
}

export enum ProductStatus {
  DRAFT = 'draft',           // 작성 중 (아직 등록 안 함)
  PUBLISHED = 'published',   // 판매 중 (고객에게 보임)
  SOLD_OUT = 'sold_out',     // 품절
  HIDDEN = 'hidden',         // 숨김 (판매자가 일시적으로 숨김)
  DISCONTINUED = 'discontinued'  // 단종
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

  @Column({ type: 'int', default: 0 })
  stockQuantity: number;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.PUBLISHED,
  })
  status: ProductStatus;

  @Column({ type: 'int', default: 0 })
  salesCount: number;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column()
  isEvent: boolean;

  @Column({ nullable: true })
  discountRate?: number;

  @Column('decimal', { precision: 3, scale: 1, nullable: true })
  rating?: number;

  @OneToMany(() => ReviewEntity, (review) => review.product)
  reviews: ReviewEntity[];

  @ManyToOne(() => WishListEntity, (wishList) => wishList.products)
  @JoinColumn()
  wishList: WishListEntity;

  @Column({
    type: 'jsonb',
    default: {},
  })
  specs: Record<string, any>;

  @ManyToMany(() => TagEntity, (tag) => tag.products, { cascade: true })
  @JoinTable({
    name: 'product_tags',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: TagEntity[];
}
