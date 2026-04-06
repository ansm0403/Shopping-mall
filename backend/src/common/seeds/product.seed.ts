import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../../product/entity/product.entity';
import { CategoryEntity } from '../../category/entity/category.entity';
import { beautyProductsData } from '../../data/beauty-products';
import { clothingProductsData } from '../../data/clothing-products';
import { shoesProductsData } from '../../data/shoes-products';
import { bookProductsData } from '../../data/book-products';
import { foodProductsData } from '../../data/food-products';
import { livingProductsData } from '../../data/living-products';

@Injectable()
export class ProductSeedService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async seedProducts() {
    const rawData = [
      ...beautyProductsData,
      ...clothingProductsData,
      ...shoesProductsData,
      ...bookProductsData,
      ...foodProductsData,
      ...livingProductsData,
    ];

    // slug 및 대문자 변형 모두 지원하는 category → id 맵 구성
    // 예: 'beauty', 'BEAUTY' → id, 'shoes-sneakers', 'SHOES-SNEAKERS' → id
    const categories = await this.categoryRepository.find();
    const categoryMap = new Map<string, number>();
    for (const cat of categories) {
      categoryMap.set(cat.slug, cat.id);
      categoryMap.set(cat.slug.toUpperCase(), cat.id);
    }

    const allData = rawData.map(({ category, imageUrl, ...rest }: any) => ({
      ...rest,
      categoryId: category ? (categoryMap.get(category) ?? null) : null,
    }));

    await this.productRepository.save(allData);

    return {
      message: `총 ${allData.length}개 상품 시드 완료 (뷰티:${beautyProductsData.length}, 의류:${clothingProductsData.length}, 신발:${shoesProductsData.length}, 도서:${bookProductsData.length}, 식품:${foodProductsData.length}, 생활:${livingProductsData.length})`,
    };
  }
}
