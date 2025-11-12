import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { BookEntity } from './entity/book/book.entity';
import { BeautyEntity } from './entity/beauty/beauty.entity';
import { LivingProductEntity } from './entity/living-product/living-product.entity';
import { ClothingEntity } from './entity/clothing/clothing.entity';
import { ProductController } from './product.controller';
import { ProductEntity } from './entity/product.entity';
import { ProductService } from './product.service';
import { ShoesEntity } from './entity/shoes/shoes.entity';
import { FoodEntity } from './entity/food/food.entity';

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
    ]),
    CommonModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [TypeOrmModule], // 다른 모듈에서 사용할 수 있도록 export
})
export class ProductModule {}
