import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource, In, LessThan, Repository } from 'typeorm';
import { customAlphabet } from 'nanoid';
import { OrderEntity, OrderStatus } from './entity/order.entity';
import { OrderItemEntity } from './entity/order-item.entity';
import { CartItemEntity } from '../cart/entity/cart-item.entity';
import { CartEntity } from '../cart/entity/cart.entity';
import { ProductEntity, ProductStatus, ApprovalStatus } from '../product/entity/product.entity';
import { PaymentEntity, PaymentStatus } from '../payment/entity/payment.entity';
import { SellerEntity, SellerStatus } from '../seller/entity/seller.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import {
  OrderCreatedEvent,
  OrderCancelledEvent,
} from './events/order.events';

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);

function generateOrderNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  return `ORD-${date}-${nanoid()}`;
}

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
    @InjectRepository(SellerEntity)
    private readonly sellerRepository: Repository<SellerEntity>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * 주문 생성 — 핵심 트랜잭션
   * 1. CartItem 조회 + 본인 카트 검증
   * 2. 각 상품 FOR UPDATE 락으로 조회
   * 3. 상태/재고 검증
   * 4. Order + OrderItems + Payment(READY) 생성
   * 5. 재고 차감 (선점)
   * 6. 트랜잭션 커밋 후 CartItem 삭제 + 이벤트
   */
  async createOrder(userId: number, dto: CreateOrderDto) {
    // 1. 본인 카트 확인
    const cart = await this.cartRepository.findOne({ where: { userId } });
    if (!cart) {
      throw new BadRequestException('장바구니가 비어있습니다.');
    }

    const orderNumber = generateOrderNumber();

    // 2~5. 트랜잭션 (CartItem 조회도 내부에서 → 동시 주문 방지)
    const { order, cartItemIds } = await this.dataSource.transaction(async (manager) => {
      // 2-a. CartItem을 트랜잭션 내에서 FOR UPDATE 락으로 조회
      //      → 동일 CartItem으로 동시 주문 생성 시 두 번째 요청이 대기하게 됨
      const cartItems = await manager
        .createQueryBuilder(CartItemEntity, 'ci')
        .setLock('pessimistic_write')
        .leftJoinAndSelect('ci.product', 'product')
        .leftJoinAndSelect('product.images', 'images')
        .where('ci.id IN (:...ids)', { ids: dto.cartItemIds })
        .andWhere('ci.cartId = :cartId', { cartId: cart.id })
        .getMany();

      if (cartItems.length !== dto.cartItemIds.length) {
        throw new BadRequestException('유효하지 않은 장바구니 아이템이 포함되어 있습니다.');
      }

      // 2-b. 각 상품도 FOR UPDATE 락 (재고 정합성)
      const productIds = cartItems.map((ci) => ci.productId);
      const products = await manager
        .createQueryBuilder(ProductEntity, 'p')
        .setLock('pessimistic_write')
        .whereInIds(productIds)
        .leftJoinAndSelect('p.images', 'images')
        .getMany();

      const productMap = new Map(products.map((p) => [p.id, p]));

      // 3. 검증 + OrderItem 준비
      let totalAmount = 0;
      const orderItemsData: Partial<OrderItemEntity>[] = [];

      for (const cartItem of cartItems) {
        const product = productMap.get(cartItem.productId);
        if (!product) {
          throw new NotFoundException(`상품 ID ${cartItem.productId}를 찾을 수 없습니다.`);
        }
        if (product.approvalStatus !== ApprovalStatus.APPROVED) {
          throw new BadRequestException(`상품 "${product.name}"은 현재 구매할 수 없습니다.`);
        }
        if (product.status !== ProductStatus.PUBLISHED) {
          throw new BadRequestException(`상품 "${product.name}"은 현재 판매 중이 아닙니다.`);
        }
        if (product.stockQuantity < cartItem.quantity) {
          throw new BadRequestException(
            `상품 "${product.name}"의 재고가 부족합니다. (재고: ${product.stockQuantity}개, 요청: ${cartItem.quantity}개)`,
          );
        }

        const primaryImage = product.images?.find((img) => img.isPrimary);
        const subtotal = Number(product.price) * cartItem.quantity;
        totalAmount += subtotal;

        orderItemsData.push({
          productId: product.id,
          sellerId: product.sellerId ?? 0,
          productName: product.name,
          productPrice: Number(product.price),
          productImageUrl: primaryImage?.url ?? null,
          quantity: cartItem.quantity,
          subtotal,
        });
      }

      // 4. Order 생성
      const orderEntity = manager.create(OrderEntity, {
        orderNumber,
        userId,
        status: OrderStatus.PENDING_PAYMENT,
        totalAmount,
        shippingAddress: dto.shippingAddress,
        recipientName: dto.recipientName,
        recipientPhone: dto.recipientPhone,
        memo: dto.memo ?? null,
      });
      const savedOrder = await manager.save(orderEntity);

      // OrderItems 생성
      const items = orderItemsData.map((data) =>
        manager.create(OrderItemEntity, { ...data, orderId: savedOrder.id }),
      );
      await manager.save(items);

      // Payment(READY) 생성
      const paymentEntity = manager.create(PaymentEntity, {
        orderId: savedOrder.id,
        merchantUid: orderNumber,
        amount: totalAmount,
        status: PaymentStatus.READY,
      });
      await manager.save(paymentEntity);

      // 5. 재고 차감 (파라미터화된 쿼리로 안전하게 처리)
      for (const cartItem of cartItems) {
        await manager
          .createQueryBuilder()
          .update(ProductEntity)
          .set({ stockQuantity: () => `"stockQuantity" - :qty` })
          .setParameter('qty', cartItem.quantity)
          .where('id = :id', { id: cartItem.productId })
          .execute();
      }

      // 6. CartItem 삭제도 트랜잭션 내에서 처리 (원자성 보장)
      await manager.delete(CartItemEntity, { id: In(dto.cartItemIds) });

      return { order: savedOrder, cartItemIds: dto.cartItemIds };
    });

    this.eventEmitter.emit(
      'order.created',
      new OrderCreatedEvent(order.id, userId, orderNumber, Number(order.totalAmount)),
    );

    // 응답용으로 relations 포함하여 재조회
    return this.findOrderByNumber(orderNumber);
  }

  /** 내 주문 목록 */
  async getMyOrders(userId: number, query: OrderQueryDto) {
    const { page = 1, take = 20, status } = query;

    const qb = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.payment', 'payment')
      .where('order.userId = :userId', { userId })
      .orderBy('order.createdAt', 'DESC')
      .take(take)
      .skip((page - 1) * take);

    if (status) {
      qb.andWhere('order.status = :status', { status });
    }

    const [data, total] = await qb.getManyAndCount();
    const lastPage = Math.ceil(total / take);

    return {
      data,
      meta: { total, page, lastPage, take, hasNextPage: page < lastPage },
    };
  }

  /** 주문 상세 (본인만) */
  async getOrderDetail(userId: number, orderNumber: string) {
    const order = await this.findOrderByNumber(orderNumber);
    if (order.userId !== userId) {
      throw new ForbiddenException('본인의 주문만 조회할 수 있습니다.');
    }
    return order;
  }

  /** 주문 취소 (PENDING_PAYMENT 상태만, 결제 전) */
  async cancelOrder(userId: number, orderNumber: string, reason?: string) {
    const order = await this.findOrderByNumber(orderNumber);
    if (order.userId !== userId) {
      throw new ForbiddenException('본인의 주문만 취소할 수 있습니다.');
    }
    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new BadRequestException('결제 대기 상태의 주문만 취소할 수 있습니다.');
    }

    await this.dataSource.transaction(async (manager) => {
      // Order → CANCELLED
      await manager.update(OrderEntity, order.id, {
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
        cancellationReason: reason ?? '구매자 취소',
      });

      // Payment → FAILED
      if (order.payment) {
        await manager.update(PaymentEntity, order.payment.id, {
          status: PaymentStatus.FAILED,
        });
      }

      // 재고 복원
      for (const item of order.items) {
        await manager
          .createQueryBuilder()
          .update(ProductEntity)
          .set({ stockQuantity: () => `"stockQuantity" + :restoreQty` })
          .setParameter('restoreQty', item.quantity)
          .where('id = :id', { id: item.productId })
          .execute();
      }
    });

    this.eventEmitter.emit(
      'order.cancelled',
      new OrderCancelledEvent(order.id, userId, orderNumber, reason ?? '구매자 취소', false),
    );

    return this.findOrderByNumber(orderNumber);
  }

  // ──────────── 셀러 메서드 ────────────

  /** 셀러: 내 상품이 포함된 주문 조회 */
  async getSellerOrders(userId: number, query: OrderQueryDto) {
    const seller = await this.sellerRepository.findOne({
      where: { userId, status: SellerStatus.APPROVED },
    });
    if (!seller) {
      throw new ForbiddenException('승인된 셀러만 조회할 수 있습니다.');
    }

    const { page = 1, take = 20, status } = query;

    const qb = this.orderRepository
      .createQueryBuilder('order')
      .innerJoinAndSelect('order.items', 'items', 'items.sellerId = :sellerId', { sellerId: seller.id })
      .leftJoinAndSelect('order.payment', 'payment')
      .orderBy('order.createdAt', 'DESC')
      .take(take)
      .skip((page - 1) * take);

    if (status) {
      qb.andWhere('order.status = :status', { status });
    }

    const [data, total] = await qb.getManyAndCount();
    const lastPage = Math.ceil(total / take);

    return {
      data,
      meta: { total, page, lastPage, take, hasNextPage: page < lastPage },
    };
  }

  /** 셀러: 상품 준비 중으로 변경 */
  async markPreparing(userId: number, orderNumber: string) {
    const seller = await this.sellerRepository.findOne({
      where: { userId, status: SellerStatus.APPROVED },
    });
    if (!seller) {
      throw new ForbiddenException('승인된 셀러만 접근할 수 있습니다.');
    }

    const order = await this.findOrderByNumber(orderNumber);
    if (order.status !== OrderStatus.PAID) {
      throw new BadRequestException('결제 완료 상태의 주문만 준비 처리할 수 있습니다.');
    }

    // 본인 상품이 포함된 주문인지 확인
    const hasMyItems = order.items.some((item) => item.sellerId === seller.id);
    if (!hasMyItems) {
      throw new ForbiddenException('본인의 상품이 포함된 주문만 처리할 수 있습니다.');
    }

    await this.orderRepository.update(order.id, {
      status: OrderStatus.PREPARING,
    });

    return this.findOrderByNumber(orderNumber);
  }

  // ──────────── 관리자 메서드 ────────────

  /** 관리자: 전체 주문 조회 */
  async getAllOrders(query: OrderQueryDto) {
    const { page = 1, take = 20, status } = query;

    const qb = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.payment', 'payment')
      .orderBy('order.createdAt', 'DESC')
      .take(take)
      .skip((page - 1) * take);

    if (status) {
      qb.andWhere('order.status = :status', { status });
    }

    const [data, total] = await qb.getManyAndCount();
    const lastPage = Math.ceil(total / take);

    return {
      data,
      meta: { total, page, lastPage, take, hasNextPage: page < lastPage },
    };
  }

  /** 관리자: 주문 상세 */
  async getOrderDetailAdmin(orderNumber: string) {
    return this.findOrderByNumber(orderNumber);
  }

  // ──────────── Cron: 주문 타임아웃 ────────────

  @Cron(CronExpression.EVERY_10_MINUTES)
  async expirePendingOrders() {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const pendingOrders = await this.orderRepository.find({
      where: {
        status: OrderStatus.PENDING_PAYMENT,
        createdAt: LessThan(thirtyMinutesAgo),
      },
      relations: ['items', 'payment'],
    });

    if (pendingOrders.length === 0) return;

    this.logger.log(`만료 대상 주문 ${pendingOrders.length}건 처리 시작`);

    for (const order of pendingOrders) {
      try {
        await this.dataSource.transaction(async (manager) => {
          await manager.update(OrderEntity, order.id, {
            status: OrderStatus.CANCELLED,
            cancelledAt: new Date(),
            cancellationReason: '결제 시간 초과 (30분)',
          });

          if (order.payment) {
            await manager.update(PaymentEntity, order.payment.id, {
              status: PaymentStatus.FAILED,
            });
          }

          for (const item of order.items) {
            await manager
              .createQueryBuilder()
              .update(ProductEntity)
              .set({ stockQuantity: () => `"stockQuantity" + :restoreQty` })
          .setParameter('restoreQty', item.quantity)
              .where('id = :id', { id: item.productId })
              .execute();
          }
        });

        this.logger.log(`주문 ${order.orderNumber} 만료 처리 완료`);

        this.eventEmitter.emit(
          'order.cancelled',
          new OrderCancelledEvent(
            order.id, order.userId, order.orderNumber,
            '결제 시간 초과', false,
          ),
        );
      } catch (error) {
        this.logger.error(`주문 ${order.orderNumber} 만료 처리 실패: ${error instanceof Error ? error.message : error}`);
      }
    }
  }

  // ──────────── 내부 헬퍼 ────────────

  private async findOrderByNumber(orderNumber: string): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({
      where: { orderNumber },
      relations: ['items', 'payment'],
    });
    if (!order) {
      throw new NotFoundException(`주문번호 ${orderNumber}를 찾을 수 없습니다.`);
    }
    return order;
  }
}
