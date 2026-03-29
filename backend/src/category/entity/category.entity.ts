import { BaseModel } from '../../common/entity/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import type { ProductEntity } from '../../product/entity/product.entity';

@Entity('categories')
export class CategoryEntity extends BaseModel {
  @Column()
  name: string;

  @Column({ unique: true })
  @Index()
  slug: string;

  @Column({ name: 'parent_id', nullable: true })
  parentId: number | null;

  @ManyToOne(() => CategoryEntity, (c) => c.children, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_id' })
  parent: CategoryEntity | null;

  @OneToMany(() => CategoryEntity, (c) => c.parent)
  children: CategoryEntity[];

  @Column({ length: 500, default: '/' })
  path: string;

  @Column({ default: 0 })
  depth: number;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_visible', default: true })
  isVisible: boolean;

  @OneToMany('ProductEntity', 'category')
  products: ProductEntity[];
}
