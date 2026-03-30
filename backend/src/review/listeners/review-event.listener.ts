import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../../product/entity/product.entity';
import { RedisService } from '../../intrastructure/redis/redis.service';
import { ReviewCreatedEvent, ReviewDeletedEvent } from '../events/review.events';
import { withRetry } from '../../common/utils/with-retry';

@Injectable()
export class ReviewEventListener {
  private readonly logger = new Logger(ReviewEventListener.name);

  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    private readonly redisService: RedisService,
  ) {}

  @OnEvent('review.created')
  async handleReviewCreated(event: ReviewCreatedEvent) {
    this.logger.log(
      `리뷰 생성 — reviewId: ${event.reviewId}, productId: ${event.productId}, rating: ${event.rating}`,
    );

    await withRetry(
      async () => {
        await this.productRepository.increment({ id: event.productId }, 'reviewCount', 1);
        await this.productRepository.increment({ id: event.productId }, 'ratingSum', event.rating);
        await this.recalculateRating(event.productId);
      },
      `review.created(productId=${event.productId})`,
    );
  }

  @OnEvent('review.deleted')
  async handleReviewDeleted(event: ReviewDeletedEvent) {
    this.logger.log(
      `리뷰 삭제 — productId: ${event.productId}, rating: ${event.rating}`,
    );

    await withRetry(
      async () => {
        await this.productRepository.decrement({ id: event.productId }, 'reviewCount', 1);
        await this.productRepository.decrement({ id: event.productId }, 'ratingSum', event.rating);
        await this.recalculateRating(event.productId);
      },
      `review.deleted(productId=${event.productId})`,
    );
  }

  /**
   * 원자적 rating 재계산 — 단일 UPDATE 쿼리로 race condition 방지
   */
  private async recalculateRating(productId: number) {
    await this.productRepository
      .createQueryBuilder()
      .update(ProductEntity)
      .set({
        rating: () =>
          `CASE WHEN "reviewCount" > 0 THEN ROUND("ratingSum"::numeric / "reviewCount", 1) ELSE NULL END`,
      })
      .where('id = :id', { id: productId })
      .execute();

    await this.redisService.delCache(`products:detail:${productId}`);
    await this.redisService.delCacheByPattern('products:list:*');
  }
}
