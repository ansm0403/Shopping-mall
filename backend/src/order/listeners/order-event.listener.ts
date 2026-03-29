import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../../product/entity/product.entity';
import { OrderItemEntity } from '../entity/order-item.entity';
import {
  OrderCreatedEvent,
  OrderPaidEvent,
  OrderCancelledEvent,
} from '../events/order.events';
import { RedisService } from '../../intrastructure/redis/redis.service';

@Injectable()
export class OrderEventListener {
  private readonly logger = new Logger(OrderEventListener.name);

  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
    private readonly redisService: RedisService,
  ) {}

  @OnEvent('order.created')
  handleOrderCreated(event: OrderCreatedEvent) {
    this.logger.log(
      `주문 생성 — orderId: ${event.orderId}, orderNumber: ${event.orderNumber}, ` +
      `userId: ${event.userId}, totalAmount: ${event.totalAmount}`,
    );
  }

  @OnEvent('order.paid')
  async handleOrderPaid(event: OrderPaidEvent) {
    this.logger.log(
      `결제 완료 — orderId: ${event.orderId}, orderNumber: ${event.orderNumber}, impUid: ${event.impUid}`,
    );

    // salesCount 증가
    const items = await this.orderItemRepository.find({
      where: { orderId: event.orderId },
    });

    for (const item of items) {
      await this.productRepository.increment(
        { id: item.productId },
        'salesCount',
        item.quantity,
      );
      // 상품 캐시 무효화
      await this.redisService.delCache(`products:detail:${item.productId}`);
    }
    await this.redisService.delCacheByPattern('products:list:*');
  }

  @OnEvent('order.cancelled')
  async handleOrderCancelled(event: OrderCancelledEvent) {
    this.logger.log(
      `주문 취소 — orderId: ${event.orderId}, orderNumber: ${event.orderNumber}, ` +
      `reason: ${event.reason}, refundRequired: ${event.refundRequired}`,
    );

    // 상품 캐시 무효화 (재고 변경됨)
    await this.redisService.delCacheByPattern('products:list:*');
  }
}
