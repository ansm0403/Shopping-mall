import { Entity, Column, ManyToMany } from 'typeorm';
import { BaseModel } from '../../common/entity/base.entity';
import { ProductEntity } from './product.entity';

@Entity('tags')
export class TagEntity extends BaseModel {
  @Column({ unique: true })
  name: string;

  @ManyToMany(() => ProductEntity, (product) => product.tags)
  products: ProductEntity[];
}
