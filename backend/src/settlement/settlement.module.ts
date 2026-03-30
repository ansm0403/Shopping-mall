import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettlementEntity } from './entity/settlement.entity';
import { OrderEntity } from '../order/entity/order.entity';
import { OrderItemEntity } from '../order/entity/order-item.entity';
import { SellerEntity } from '../seller/entity/seller.entity';
import { SettlementService } from './settlement.service';
import {
  SellerSettlementController,
  AdminSettlementController,
} from './settlement.controller';
import { SettlementEventListener } from './listeners/settlement-event.listener';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SettlementEntity,
      OrderEntity,
      OrderItemEntity,
      SellerEntity,
    ]),
    AuthModule,
  ],
  controllers: [SellerSettlementController, AdminSettlementController],
  providers: [SettlementService, SettlementEventListener],
  exports: [TypeOrmModule],
})
export class SettlementModule {}
