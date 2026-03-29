import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { OrderEntity } from './entity/order.entity';
import { OrderItemEntity } from './entity/order-item.entity';
import { CartEntity } from '../cart/entity/cart.entity';
import { CartItemEntity } from '../cart/entity/cart-item.entity';
import { ProductEntity } from '../product/entity/product.entity';
import { PaymentEntity } from '../payment/entity/payment.entity';
import { SellerEntity } from '../seller/entity/seller.entity';
import { OrderController, SellerOrderController, AdminOrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderEventListener } from './listeners/order-event.listener';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity,
      OrderItemEntity,
      CartEntity,
      CartItemEntity,
      ProductEntity,
      PaymentEntity,
      SellerEntity,
    ]),
    ScheduleModule.forRoot(),
    AuthModule,
  ],
  controllers: [OrderController, SellerOrderController, AdminOrderController],
  providers: [OrderService, OrderEventListener],
  exports: [TypeOrmModule, OrderService],
})
export class OrderModule {}
