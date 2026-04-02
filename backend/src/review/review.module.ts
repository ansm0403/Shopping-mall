import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { ReviewEntity } from './entity/review.entity';
import { OrderEntity } from '../order/entity/order.entity';
import { OrderItemEntity } from '../order/entity/order-item.entity';
import { ProductEntity } from '../product/entity/product.entity';
import { ReviewEventListener } from './listeners/review-event.listener';
import { AuthModule } from '../auth/auth.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReviewEntity,
      OrderEntity,
      OrderItemEntity,
      ProductEntity,
    ]),
    AuthModule,
    CommonModule,
  ],
  controllers: [ReviewController],
  providers: [ReviewService, ReviewEventListener],
  exports: [TypeOrmModule],
})
export class ReviewModule {}
