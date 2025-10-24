import { Module } from '@nestjs/common';
import { WishListService } from './wish-list.service';
import { WishListController } from './wish-list.controller';
import { WishListEntity } from './entity/wishList.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([WishListEntity])],
  controllers: [WishListController],
  providers: [WishListService],
  exports: [TypeOrmModule],
})
export class WishListModule {}
