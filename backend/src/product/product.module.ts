import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductEntity } from './entity/product.entity';
import { BeautyEntity } from './entity/beauty/beauty.entity';
import { ClothingEntity } from './entity/clothing/clothing.entity';
import { FoodEntity } from './entity/food/food.entity';
import { BookEntity } from './entity/book/book.entity';
import { LivingProductEntity } from './entity/living-product/living-product.entity';
import { ShoesEntity } from './entity/shoes/shoes.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      BeautyEntity,
      ClothingEntity,
      FoodEntity,
      BookEntity,
      LivingProductEntity,
      ShoesEntity,
    ])
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [TypeOrmModule], // 다른 모듈에서 사용할 수 있도록 export
})
export class ProductModule {}
