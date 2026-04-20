import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../../product/entity/product.entity';
import { ProductImageEntity } from '../../product/entity/product-image.entity';
import { CategoryEntity } from '../../category/entity/category.entity';

@Injectable()
export class ProductSeedService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(ProductImageEntity)
    private readonly productImageRepository: Repository<ProductImageEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async seedProducts() {
    const [
      { beautyProductsData },
      { clothingProductsData },
      { shoesProductsData },
      { bookProductsData },
      { foodProductsData },
      { livingProductsData },
    ] = await Promise.all([
      import('../../data/beauty-products'),
      import('../../data/clothing-products'),
      import('../../data/shoes-products'),
      import('../../data/book-products'),
      import('../../data/food-products'),
      import('../../data/living-products'),
    ]);

    const rawData = [
      ...beautyProductsData,
      ...clothingProductsData,
      ...shoesProductsData,
      ...bookProductsData,
      ...foodProductsData,
      ...livingProductsData,
    ];

    // slug 및 대문자 변형 모두 지원하는 category → id 맵 구성
    const categories = await this.categoryRepository.find();
    const categoryMap = new Map<string, number>();
    for (const cat of categories) {
      categoryMap.set(cat.slug, cat.id);
      categoryMap.set(cat.slug.toUpperCase(), cat.id);
    }

    // 기존 상품 전체 삭제 (CASCADE로 연관 테이블 포함)
    await this.productRepository.manager.query('TRUNCATE TABLE products CASCADE');

    for (const { category, imageUrl, ...rest } of rawData as any[]) {
      const product = await this.productRepository.save({
        ...rest,
        categoryId: category ? (categoryMap.get(category) ?? null) : null,
      });

      if (imageUrl) {
        await this.productImageRepository.save([
          { url: imageUrl, isPrimary: true, sortOrder: 0, product },
          { url: imageUrl, isPrimary: false, sortOrder: 1, product },
          { url: imageUrl, isPrimary: false, sortOrder: 2, product },
        ]);
      }
    }

    return {
      message: `총 ${rawData.length}개 상품 시드 완료 (뷰티:${beautyProductsData.length}, 의류:${clothingProductsData.length}, 신발:${shoesProductsData.length}, 도서:${bookProductsData.length}, 식품:${foodProductsData.length}, 생활:${livingProductsData.length})`,
    };
  }
}
