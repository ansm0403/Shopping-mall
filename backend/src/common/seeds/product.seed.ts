import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../../product/entity/product.entity';
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
  ) {}

  async seedProducts() {
    const allData = [
      ...beautyProductsData,
      ...clothingProductsData,
      ...shoesProductsData,
      ...bookProductsData,
      ...foodProductsData,
      ...livingProductsData,
    ];

    // category/imageUrl 필드는 스키마 변경으로 TypeORM이 무시함
    // sellerId, categoryId는 null로 저장 (운영 시 Admin이 별도 설정)
    await this.productRepository.save(allData as any[]);

    return {
      message: `총 ${allData.length}개 상품 시드 완료 (뷰티:${beautyProductsData.length}, 의류:${clothingProductsData.length}, 신발:${shoesProductsData.length}, 도서:${bookProductsData.length}, 식품:${foodProductsData.length}, 생활:${livingProductsData.length})`,
    };
  }
}
