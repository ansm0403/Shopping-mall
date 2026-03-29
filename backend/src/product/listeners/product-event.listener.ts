import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RedisService } from '../../intrastructure/redis/redis.service';
import {
  ProductCreatedEvent,
  ProductApprovedEvent,
  ProductRejectedEvent,
} from '../events/product.events';

@Injectable()
export class ProductEventListener {
  private readonly logger = new Logger(ProductEventListener.name);

  constructor(private readonly redisService: RedisService) {}

  @OnEvent('product.created')
  handleProductCreated(event: ProductCreatedEvent) {
    this.logger.log(
      `상품 등록 — productId: ${event.productId}, sellerId: ${event.sellerId} → 관리자 승인 대기`,
    );
  }

  @OnEvent('product.approved')
  async handleProductApproved(event: ProductApprovedEvent) {
    this.logger.log(
      `상품 승인 — productId: ${event.productId}, sellerId: ${event.sellerId} → 셀러에게 알림 예정`,
    );
    await this.invalidateProductCache(event.productId);
  }

  @OnEvent('product.rejected')
  async handleProductRejected(event: ProductRejectedEvent) {
    this.logger.log(
      `상품 거절 — productId: ${event.productId}, sellerId: ${event.sellerId}, 사유: ${event.reason} → 셀러에게 알림 예정`,
    );
    await this.invalidateProductCache(event.productId);
  }

  private async invalidateProductCache(productId: number) {
    await Promise.all([
      this.redisService.delCacheByPattern('products:list:*'),
      this.redisService.delCache(`products:detail:${productId}`),
    ]);
    this.logger.log(`캐시 무효화 완료 — productId: ${productId}`);
  }
}
