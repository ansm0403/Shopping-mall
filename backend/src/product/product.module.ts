import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { ProductEntity } from './entity/product.entity';
import { ProductImageEntity } from './entity/product-image.entity';
import { TagEntity } from './entity/tag.entity';
import { BookEntity } from './entity/book/book.entity';
import { BeautyEntity } from './entity/beauty/beauty.entity';
import { LivingProductEntity } from './entity/living-product/living-product.entity';
import { ClothingEntity } from './entity/clothing/clothing.entity';
import { ShoesEntity } from './entity/shoes/shoes.entity';
import { FoodEntity } from './entity/food/food.entity';
import { SellerEntity } from '../seller/entity/seller.entity';
import { ProductController, AdminProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductSeedService } from '../common/seeds/product.seed';
import { ProductEventListener } from './listeners/product-event.listener';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      ProductImageEntity,
      TagEntity,
      BeautyEntity,
      ClothingEntity,
      FoodEntity,
      BookEntity,
      LivingProductEntity,
      ShoesEntity,
      SellerEntity,
    ]),
    CommonModule,
    AuthModule,
  ],
  controllers: [ProductController, AdminProductController],
  providers: [ProductService, ProductSeedService, ProductEventListener],
  exports: [TypeOrmModule, ProductService],
})
export class ProductModule {}
