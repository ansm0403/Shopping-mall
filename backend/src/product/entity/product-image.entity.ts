import { BaseModel } from '../../common/entity/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import type { ProductEntity } from './product.entity';

@Entity('product_images')
export class ProductImageEntity extends BaseModel {
  @Column()
  url: string;

  @Column({ default: false })
  isPrimary: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @ManyToOne('ProductEntity', 'images', { onDelete: 'CASCADE' })
  product: ProductEntity;
}
