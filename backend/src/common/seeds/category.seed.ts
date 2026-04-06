import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from '../../category/entity/category.entity';

interface SeedCategory {
  name: string;
  slug: string;
  sortOrder: number;
  children?: { name: string; slug: string; sortOrder: number }[];
}

const SEED_DATA: SeedCategory[] = [
  {
    name: '의류',
    slug: 'clothing',
    sortOrder: 0,
    children: [
      { name: '봄', slug: 'clothing-spring', sortOrder: 0 },
      { name: '여름', slug: 'clothing-summer', sortOrder: 1 },
      { name: '가을', slug: 'clothing-fall', sortOrder: 2 },
      { name: '겨울', slug: 'clothing-winter', sortOrder: 3 },
    ],
  },
  {
    name: '뷰티',
    slug: 'beauty',
    sortOrder: 1,
    children: [
      { name: '지성', slug: 'beauty-oily', sortOrder: 0 },
      { name: '건성', slug: 'beauty-dry', sortOrder: 1 },
      { name: '복합성', slug: 'beauty-combination', sortOrder: 2 },
      { name: '민감성', slug: 'beauty-sensitive', sortOrder: 3 },
      { name: '모든 피부', slug: 'beauty-all', sortOrder: 4 },
    ],
  },
  {
    name: '신발',
    slug: 'shoes',
    sortOrder: 2,
    children: [
      { name: '스니커즈', slug: 'shoes-sneakers', sortOrder: 0 },
      { name: '구두', slug: 'shoes-dress', sortOrder: 1 },
      { name: '부츠', slug: 'shoes-boots', sortOrder: 2 },
      { name: '샌들', slug: 'shoes-sandals', sortOrder: 3 },
    ],
  },
  {
    name: '책',
    slug: 'book',
    sortOrder: 3,
    children: [
      { name: '소설', slug: 'book-novel', sortOrder: 0 },
      { name: '에세이', slug: 'book-essay', sortOrder: 1 },
      { name: '자기계발', slug: 'book-self-help', sortOrder: 2 },
      { name: '만화', slug: 'book-comic', sortOrder: 3 },
    ],
  },
  {
    name: '식품',
    slug: 'food',
    sortOrder: 4,
    children: [
      { name: '과자', slug: 'food-snack', sortOrder: 0 },
      { name: '음료', slug: 'food-beverage', sortOrder: 1 },
      { name: '신선식품', slug: 'food-fresh', sortOrder: 2 },
      { name: '간편식', slug: 'food-instant', sortOrder: 3 },
    ],
  },
  {
    name: '생활용품',
    slug: 'living',
    sortOrder: 5,
  },
];

@Injectable()
export class CategorySeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async onApplicationBootstrap() {
    for (const item of SEED_DATA) {
      const parent = await this.upsertCategory({
        name: item.name,
        slug: item.slug,
        parentId: null,
        path: `/${item.slug}`,
        depth: 0,
        sortOrder: item.sortOrder,
      });

      if (!item.children) continue;

      for (const child of item.children) {
        await this.upsertCategory({
          name: child.name,
          slug: child.slug,
          parentId: parent.id,
          path: `/${item.slug}/${child.slug}`,
          depth: 1,
          sortOrder: child.sortOrder,
        });
      }
    }
  }

  private async upsertCategory(data: {
    name: string;
    slug: string;
    parentId: number | null;
    path: string;
    depth: number;
    sortOrder: number;
  }): Promise<CategoryEntity> {
    const existing = await this.categoryRepository.findOne({
      where: { slug: data.slug },
    });
    if (existing) return existing;

    const entity = this.categoryRepository.create({
      name: data.name,
      slug: data.slug,
      parentId: data.parentId,
      path: data.path,
      depth: data.depth,
      sortOrder: data.sortOrder,
      isVisible: true,
    });
    return this.categoryRepository.save(entity);
  }
}
