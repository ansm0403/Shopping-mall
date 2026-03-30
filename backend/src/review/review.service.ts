import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ReviewEntity } from './entity/review.entity';
import { OrderEntity, OrderStatus } from '../order/entity/order.entity';
import { OrderItemEntity } from '../order/entity/order-item.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewCreatedEvent, ReviewDeletedEvent } from './events/review.events';
import { BasePaginateDto } from '../common/dto/paginate.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(ReviewEntity)
    private readonly reviewRepository: Repository<ReviewEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(userId: number, dto: CreateReviewDto) {
    // 1. 주문 검증: COMPLETED 상태인지
    const order = await this.orderRepository.findOne({
      where: { id: dto.orderId, userId },
    });

    if (!order) {
      throw new NotFoundException('주문을 찾을 수 없습니다.');
    }

    if (order.status !== OrderStatus.COMPLETED) {
      throw new BadRequestException('구매 확정된 주문에 대해서만 리뷰를 작성할 수 있습니다.');
    }

    // 2. 해당 주문에 해당 상품이 포함되어 있는지 검증
    const orderItem = await this.orderItemRepository.findOne({
      where: { orderId: dto.orderId, productId: dto.productId },
    });

    if (!orderItem) {
      throw new BadRequestException('해당 주문에 포함되지 않은 상품입니다.');
    }

    // 3. 중복 리뷰 방지
    const existing = await this.reviewRepository.findOne({
      where: { userId, productId: dto.productId, orderId: dto.orderId },
    });

    if (existing) {
      throw new BadRequestException('이미 해당 주문에 대한 리뷰를 작성하셨습니다.');
    }

    // 4. 리뷰 생성
    const review = this.reviewRepository.create({
      userId,
      productId: dto.productId,
      orderId: dto.orderId,
      rating: dto.rating,
      comment: dto.comment,
      imageUrls: dto.imageUrls ?? [],
    });

    const saved = await this.reviewRepository.save(review);

    this.eventEmitter.emit(
      'review.created',
      new ReviewCreatedEvent(saved.id, saved.productId, saved.rating),
    );

    return this.findOneWithUser(saved.id);
  }

  async update(userId: number, reviewId: number, dto: UpdateReviewDto) {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('본인의 리뷰만 수정할 수 있습니다.');
    }

    // 30일 수정 제한
    const daysSinceCreation =
      (Date.now() - review.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation > 30) {
      throw new BadRequestException('리뷰 작성 후 30일이 지나 수정할 수 없습니다.');
    }

    const oldRating = review.rating;

    if (dto.rating !== undefined) review.rating = dto.rating;
    if (dto.comment !== undefined) review.comment = dto.comment;
    if (dto.imageUrls !== undefined) review.imageUrls = dto.imageUrls;

    await this.reviewRepository.save(review);

    // rating이 변경된 경우 이벤트 발행 (삭제 후 생성으로 처리)
    if (dto.rating !== undefined && dto.rating !== oldRating) {
      this.eventEmitter.emit(
        'review.deleted',
        new ReviewDeletedEvent(review.productId, oldRating),
      );
      this.eventEmitter.emit(
        'review.created',
        new ReviewCreatedEvent(review.id, review.productId, dto.rating),
      );
    }

    return this.findOneWithUser(review.id);
  }

  async delete(userId: number, reviewId: number, isAdmin: boolean) {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    }

    if (!isAdmin && review.userId !== userId) {
      throw new ForbiddenException('본인의 리뷰만 삭제할 수 있습니다.');
    }

    await this.reviewRepository.remove(review);

    this.eventEmitter.emit(
      'review.deleted',
      new ReviewDeletedEvent(review.productId, review.rating),
    );

    return { message: '리뷰가 삭제되었습니다.' };
  }

  async getByProduct(productId: number, query: BasePaginateDto) {
    const page = query.page ?? 1;
    const take = query.take ?? 20;
    const sortBy = query.sortBy === 'rating' ? 'rating' : 'createdAt';
    const sortOrder = query.sortOrder ?? 'DESC';

    const [reviews, total] = await this.reviewRepository.findAndCount({
      where: { productId },
      relations: ['user'],
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * take,
      take,
    });

    return {
      data: reviews,
      meta: {
        total,
        page,
        take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async getMyReviews(userId: number, query: BasePaginateDto) {
    const page = query.page ?? 1;
    const take = query.take ?? 20;

    const [reviews, total] = await this.reviewRepository.findAndCount({
      where: { userId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * take,
      take,
    });

    return {
      data: reviews,
      meta: {
        total,
        page,
        take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  private async findOneWithUser(reviewId: number) {
    return this.reviewRepository.findOne({
      where: { id: reviewId },
      relations: ['user'],
    });
  }
}
