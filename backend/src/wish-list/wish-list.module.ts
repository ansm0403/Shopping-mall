import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WishListService } from './wish-list.service';
import { WishListController } from './wish-list.controller';
import { WishListItemEntity } from './entity/wishList.entity';
import { ProductEntity } from '../product/entity/product.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WishListItemEntity, ProductEntity]),
    AuthModule,
  ],
  controllers: [WishListController],
  providers: [WishListService],
  exports: [TypeOrmModule],
})
export class WishListModule {}
