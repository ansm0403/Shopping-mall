import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ProductEntity } from '../../product/entity/product.entity';
import { OrderEntity, OrderStatus } from '../entity/order.entity';
import { OrderItemEntity } from '../entity/order-item.entity';
import { ShipmentEntity, ShipmentStatus } from '../entity/shipment.entity';
import {
  OrderCreatedEvent,
  OrderPaidEvent,
  OrderCancelledEvent,
} from '../events/order.events';
import { RedisService } from '../../intrastructure/redis/redis.service';
import { withRetry } from '../../common/utils/with-retry';

@Injectable()
export class OrderEventListener {
  private readonly logger = new Logger(OrderEventListener.name);

  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
    private readonly dataSource: DataSource,
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

    await withRetry(
      () => this.processOrderPaid(event),
      `order.paid(orderId=${event.orderId})`,
    );
  }

  private async processOrderPaid(event: OrderPaidEvent) {
    // 멱등성 가드: 이미 PREPARING 이상이면 중복 처리 방지
    const order = await this.orderRepository.findOne({ where: { id: event.orderId } });
    if (!order || order.status !== OrderStatus.PAID) {
      this.logger.warn(
        `order.paid 이벤트 중복 감지 또는 상태 불일치 — orderId: ${event.orderId}, currentStatus: ${order?.status}`,
      );
      return;
    }

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
      await this.redisService.delCache(`products:detail:${item.productId}`);
    }
    await this.redisService.delCacheByPattern('products:list:*');

    // 트랜잭션: Order → PREPARING + Shipment 생성 (원자적)
    await this.dataSource.transaction(async (manager) => {
      await manager.update(OrderEntity, event.orderId, {
        status: OrderStatus.PREPARING,
      });

      const sellerIds = [...new Set(items.map((item) => item.sellerId))];

      // 멱등성: 이미 Shipment이 존재하면 스킵
      for (const sellerId of sellerIds) {
        const existing = await manager.findOne(ShipmentEntity, {
          where: { orderId: event.orderId, sellerId },
        });
        if (!existing) {
          const shipment = manager.create(ShipmentEntity, {
            orderId: event.orderId,
            sellerId,
            status: ShipmentStatus.PREPARING,
          });
          await manager.save(shipment);
        }
      }

      this.logger.log(
        `Shipment 생성 완료 — orderNumber: ${event.orderNumber}, sellerIds: [${sellerIds.join(', ')}]`,
      );
    });
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
