import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource, Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { PaymentEntity, PaymentStatus } from './entity/payment.entity';
import { OrderEntity, OrderStatus } from '../order/entity/order.entity';
import { ShipmentEntity } from '../order/entity/shipment.entity';
import { ProductEntity } from '../product/entity/product.entity';
import { OrderItemEntity } from '../order/entity/order-item.entity';
import { RedisService } from '../intrastructure/redis/redis.service';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { CancelPaymentDto } from './dto/cancel-payment.dto';
import { WebhookPaymentDto } from './dto/webhook-payment.dto';
import { OrderPaidEvent, OrderCancelledEvent } from '../order/events/order.events';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private static readonly PORTONE_API_URL = 'https://api.iamport.kr';
  private static readonly TOKEN_CACHE_KEY = 'portone:access_token';

  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    private readonly dataSource: DataSource,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ──────────── 포트원 API 통신 ────────────

  /** 포트원 V1 액세스 토큰 발급 (Redis 캐싱) */
  private async getPortOneAccessToken(): Promise<string> {
    const cached = await this.redisService.getCache<string>(PaymentService.TOKEN_CACHE_KEY);
    if (cached) return cached;

    const impKey = this.configService.get<string>('PORTONE_IMP_KEY');
    const impSecret = this.configService.get<string>('PORTONE_IMP_SECRET');

    if (!impKey || !impSecret) {
      throw new InternalServerErrorException('포트원 API 키가 설정되지 않았습니다.');
    }

    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${PaymentService.PORTONE_API_URL}/users/getToken`, {
          imp_key: impKey,
          imp_secret: impSecret,
        }),
      );

      if (data.code !== 0) {
        throw new InternalServerErrorException(`포트원 토큰 발급 실패: ${data.message}`);
      }

      const token = data.response.access_token;
      // 토큰 유효시간은 30분이지만 안전하게 25분으로 캐싱
      await this.redisService.setCache(PaymentService.TOKEN_CACHE_KEY, token, 25 * 60);

      return token;
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(`포트원 토큰 API 통신 실패: ${error.message}`);
        throw new InternalServerErrorException('결제 서비스에 일시적으로 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      }
      throw error;
    }
  }

  /** 포트원에서 결제 정보 조회 */
  private async getPaymentFromPortOne(impUid: string): Promise<any> {
    const token = await this.getPortOneAccessToken();

    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          `${PaymentService.PORTONE_API_URL}/payments/${impUid}`,
          { headers: { Authorization: `Bearer ${token}` } },
        ),
      );

      if (data.code !== 0) {
        throw new BadRequestException(`포트원 결제 조회 실패: ${data.message}`);
      }

      return data.response;
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(`포트원 결제 조회 API 통신 실패: ${error.message}, impUid: ${impUid}`);
        throw new InternalServerErrorException('결제 정보 조회에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
      throw error;
    }
  }

  /** 포트원에 결제 취소 요청 */
  private async cancelPaymentOnPortOne(
    impUid: string,
    reason: string,
    amount?: number,
  ): Promise<any> {
    const token = await this.getPortOneAccessToken();

    const body: any = {
      imp_uid: impUid,
      reason,
    };
    if (amount !== undefined) {
      body.amount = amount;
    }

    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          `${PaymentService.PORTONE_API_URL}/payments/cancel`,
          body,
          { headers: { Authorization: `Bearer ${token}` } },
        ),
      );

      if (data.code !== 0) {
        throw new InternalServerErrorException(`포트원 결제 취소 실패: ${data.message}`);
      }

      return data.response;
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(`포트원 결제 취소 API 통신 실패: ${error.message}, impUid: ${impUid}`);
        throw new InternalServerErrorException('결제 취소 요청에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
      throw error;
    }
  }

  // ──────────── 공개 메서드 ────────────

  /**
   * 결제 검증 (핵심)
   * 1. 포트원에서 실제 결제 정보 조회
   * 2. DB 주문 금액과 비교 (위변조 방지)
   * 3. 멱등성: 이미 PAID면 기존 결과 반환
   * 4. 트랜잭션: Payment → PAID, Order → PAID
   */
  async verifyPayment(userId: number, dto: VerifyPaymentDto) {
    // Payment 조회
    const payment = await this.paymentRepository.findOne({
      where: { merchantUid: dto.merchantUid },
      relations: ['order'],
    });
    if (!payment) {
      throw new NotFoundException(`결제 정보를 찾을 수 없습니다: ${dto.merchantUid}`);
    }

    // 본인 주문 확인
    if (payment.order.userId !== userId) {
      throw new ForbiddenException('본인의 주문만 결제할 수 있습니다.');
    }

    // 멱등성: 이미 결제 완료된 경우
    if (payment.status === PaymentStatus.PAID) {
      this.logger.log(`중복 결제 검증 요청 — merchantUid: ${dto.merchantUid}`);
      return payment;
    }

    // 이미 취소/실패된 주문 (Cron 타임아웃 또는 수동 취소)
    if (payment.status === PaymentStatus.FAILED || payment.status === PaymentStatus.CANCELLED) {
      this.logger.warn(
        `만료/취소된 주문에 결제 검증 시도 — merchantUid: ${dto.merchantUid}, paymentStatus: ${payment.status}`,
      );

      // 포트원에서 실제로 결제가 되었다면 자동 환불 처리
      try {
        const portonePayment = await this.getPaymentFromPortOne(dto.impUid);
        if (portonePayment.status === 'paid') {
          this.logger.warn(`만료된 주문에 대한 포트원 결제 감지 — 자동 취소 진행. impUid: ${dto.impUid}`);
          await this.cancelPaymentOnPortOne(dto.impUid, '주문 만료 후 결제 건 자동 취소');
        }
      } catch (e) {
        this.logger.error(`만료 주문 자동 취소 처리 실패: ${e instanceof Error ? e.message : e}`);
      }

      throw new BadRequestException(
        '이미 취소되었거나 만료된 주문입니다. 주문을 다시 생성해주세요.',
      );
    }

    // 1. 포트원 결제 정보 조회
    const portonePayment = await this.getPaymentFromPortOne(dto.impUid);

    // 2. 결제 상태 확인
    if (portonePayment.status !== 'paid') {
      throw new BadRequestException(
        `결제가 완료되지 않았습니다. 상태: ${portonePayment.status}`,
      );
    }

    // 3. 금액 위변조 검증
    const expectedAmount = Number(payment.amount);
    if (portonePayment.amount !== expectedAmount) {
      this.logger.error(
        `금액 위변조 감지! expected: ${expectedAmount}, actual: ${portonePayment.amount}, ` +
        `impUid: ${dto.impUid}, merchantUid: ${dto.merchantUid}`,
      );

      // 포트원에 자동 취소
      try {
        await this.cancelPaymentOnPortOne(dto.impUid, '결제 금액 위변조 감지');
      } catch (e) {
        this.logger.error(`위변조 건 자동 취소 실패: ${e instanceof Error ? e.message : e}`);
      }

      throw new BadRequestException('결제 금액이 일치하지 않습니다. 결제가 취소되었습니다.');
    }

    // 4. 트랜잭션: SELECT FOR UPDATE → 상태 재검증 → 갱신 (동시 요청 방지)
    const updated = await this.dataSource.transaction(async (manager) => {
      const locked = await manager
        .createQueryBuilder(PaymentEntity, 'p')
        .setLock('pessimistic_write')
        .where('p.id = :id', { id: payment.id })
        .getOne();

      if (!locked) {
        throw new NotFoundException('결제 정보가 삭제되었습니다.');
      }

      // 트랜잭션 내 재검증: 웹훅이 먼저 처리했을 수 있음
      if (locked.status === PaymentStatus.PAID) {
        return null; // 이미 처리됨
      }

      await manager.update(PaymentEntity, payment.id, {
        impUid: dto.impUid,
        status: PaymentStatus.PAID,
        paymentMethod: portonePayment.pay_method ?? null,
        pgProvider: portonePayment.pg_provider ?? null,
        receiptUrl: portonePayment.receipt_url ?? null,
        paidAt: new Date(portonePayment.paid_at * 1000),
        rawResponse: portonePayment,
      });

      await manager.update(OrderEntity, payment.orderId, {
        status: OrderStatus.PAID,
        paidAt: new Date(portonePayment.paid_at * 1000),
      });

      return locked;
    });

    // 이미 다른 요청(웹훅)이 처리한 경우 — 이벤트 중복 발행 방지
    if (updated) {
      this.eventEmitter.emit(
        'order.paid',
        new OrderPaidEvent(
          payment.orderId,
          userId,
          payment.merchantUid,
          dto.impUid,
        ),
      );
    }

    return this.paymentRepository.findOne({
      where: { id: payment.id },
      relations: ['order'],
    });
  }

  /**
   * 결제 취소 (결제 완료 후 취소 = 환불)
   */
  async cancelPayment(userId: number, orderNumber: string, dto: CancelPaymentDto) {
    const order = await this.orderRepository.findOne({
      where: { orderNumber },
      relations: ['items', 'payment'],
    });
    if (!order) {
      throw new NotFoundException(`주문번호 ${orderNumber}를 찾을 수 없습니다.`);
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('본인의 주문만 취소할 수 있습니다.');
    }

    if (order.status !== OrderStatus.PAID && order.status !== OrderStatus.PREPARING) {
      throw new BadRequestException('결제 완료 또는 상품 준비 중 상태의 주문만 취소할 수 있습니다.');
    }

    if (!order.payment || !order.payment.impUid) {
      throw new BadRequestException('결제 정보를 찾을 수 없습니다.');
    }

    // 포트원에 환불 요청
    const cancelResult = await this.cancelPaymentOnPortOne(
      order.payment.impUid,
      dto.reason,
    );

    // 트랜잭션: 상태 변경 + 재고 복원
    await this.dataSource.transaction(async (manager) => {
      await manager.update(PaymentEntity, order.payment.id, {
        status: PaymentStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelAmount: cancelResult.cancel_amount,
        cancelReason: dto.reason,
        rawResponse: cancelResult,
      });

      await manager.update(OrderEntity, order.id, {
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
        cancellationReason: dto.reason,
      });

      // PREPARING 상태에서 취소 시 Shipment 삭제
      if (order.status === OrderStatus.PREPARING) {
        await manager.delete(ShipmentEntity, { orderId: order.id });
      }

      // 재고 복원 + salesCount 차감
      for (const item of order.items) {
        await manager
          .createQueryBuilder()
          .update(ProductEntity)
          .set({
            stockQuantity: () => `"stockQuantity" + :restoreQty`,
            salesCount: () => `GREATEST("salesCount" - :salesQty, 0)`,
          })
          .setParameter('restoreQty', item.quantity)
          .setParameter('salesQty', item.quantity)
          .where('id = :id', { id: item.productId })
          .execute();
      }
    });

    this.eventEmitter.emit(
      'order.cancelled',
      new OrderCancelledEvent(
        order.id, userId, orderNumber, dto.reason, true,
      ),
    );

    return this.paymentRepository.findOne({
      where: { id: order.payment.id },
      relations: ['order'],
    });
  }

  /** 관리자: 결제 취소 (userId 검증 없음, PREPARING 상태 취소 가능) */
  async cancelPaymentByAdmin(orderNumber: string, dto: CancelPaymentDto) {
    const order = await this.orderRepository.findOne({
      where: { orderNumber },
      relations: ['items', 'payment'],
    });
    if (!order) {
      throw new NotFoundException(`주문번호 ${orderNumber}를 찾을 수 없습니다.`);
    }

    if (order.status !== OrderStatus.PAID && order.status !== OrderStatus.PREPARING) {
      throw new BadRequestException('결제 완료 또는 상품 준비 중 상태의 주문만 취소할 수 있습니다.');
    }

    if (!order.payment || !order.payment.impUid) {
      throw new BadRequestException('결제 정보를 찾을 수 없습니다.');
    }

    const cancelResult = await this.cancelPaymentOnPortOne(
      order.payment.impUid,
      dto.reason,
    );

    await this.dataSource.transaction(async (manager) => {
      await manager.update(PaymentEntity, order.payment.id, {
        status: PaymentStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelAmount: cancelResult.cancel_amount,
        cancelReason: dto.reason,
        rawResponse: cancelResult,
      });

      await manager.update(OrderEntity, order.id, {
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
        cancellationReason: dto.reason,
      });

      // Shipment 삭제
      await manager.delete(ShipmentEntity, { orderId: order.id });

      // 재고 복원 + salesCount 차감
      for (const item of order.items) {
        await manager
          .createQueryBuilder()
          .update(ProductEntity)
          .set({
            stockQuantity: () => `"stockQuantity" + :restoreQty`,
            salesCount: () => `GREATEST("salesCount" - :salesQty, 0)`,
          })
          .setParameter('restoreQty', item.quantity)
          .setParameter('salesQty', item.quantity)
          .where('id = :id', { id: item.productId })
          .execute();
      }
    });

    this.eventEmitter.emit(
      'order.cancelled',
      new OrderCancelledEvent(
        order.id, order.userId, orderNumber, dto.reason, true,
      ),
    );

    return this.paymentRepository.findOne({
      where: { id: order.payment.id },
      relations: ['order'],
    });
  }

  // ──────────── 웹훅 ────────────

  /**
   * PortOne 웹훅 처리
   * 클라이언트가 verifyPayment를 호출하지 못하는 경우(네트워크 끊김, 브라우저 닫힘 등)를 보완.
   * 기존 verifyPayment 로직을 재사용하되, userId 검증 없이 서버 간 통신으로 처리.
   *
   * 중요: PortOne은 5xx 응답 시 재시도하므로, 내부 에러가 발생해도
   * 항상 200 + 에러 메시지로 응답하여 무한 재시도를 방지합니다.
   */
  async handleWebhook(dto: WebhookPaymentDto) {
    const { imp_uid, merchant_uid, status } = dto;

    this.logger.log(`PortOne 웹훅 수신 — impUid: ${imp_uid}, merchantUid: ${merchant_uid}, status: ${status}`);

    try {
      return await this.processWebhook(imp_uid, merchant_uid, status);
    } catch (error) {
      this.logger.error(
        `웹훅 처리 중 예외 발생 — impUid: ${imp_uid}, merchantUid: ${merchant_uid}, ` +
        `error: ${error instanceof Error ? error.message : error}`,
        error instanceof Error ? error.stack : undefined,
      );
      // 500 대신 200으로 응답 — PortOne 무한 재시도 방지
      return { message: 'internal error', error: error instanceof Error ? error.message : String(error) };
    }
  }

  private async processWebhook(imp_uid: string, merchant_uid: string, status: string | undefined) {

    // paid 상태만 처리 (취소 등은 별도 로직 불필요 — 우리 서버에서 취소를 먼저 발행하므로)
    if (status !== 'paid') {
      this.logger.log(`웹훅 상태 ${status} — 처리 스킵`);
      return { message: 'ok' };
    }

    // Payment 조회
    const payment = await this.paymentRepository.findOne({
      where: { merchantUid: merchant_uid },
      relations: ['order'],
    });

    if (!payment) {
      this.logger.warn(`웹훅: 결제 정보를 찾을 수 없음 — merchantUid: ${merchant_uid}`);
      return { message: 'payment not found' };
    }

    // 이미 처리 완료된 경우 (멱등성)
    if (payment.status === PaymentStatus.PAID) {
      this.logger.log(`웹훅: 이미 결제 완료 — merchantUid: ${merchant_uid}`);
      return { message: 'already paid' };
    }

    // 만료/취소된 주문에 결제가 들어온 경우 → 자동 환불
    if (payment.status === PaymentStatus.FAILED || payment.status === PaymentStatus.CANCELLED) {
      this.logger.warn(`웹훅: 만료/취소된 주문에 결제 감지 — 자동 취소 진행. impUid: ${imp_uid}`);
      try {
        await this.cancelPaymentOnPortOne(imp_uid, '주문 만료/취소 후 결제 건 자동 환불 (웹훅)');
      } catch (e) {
        this.logger.error(`웹훅: 자동 환불 실패 — ${e instanceof Error ? e.message : e}`);
      }
      return { message: 'refunded - order expired' };
    }

    // READY 상태인 경우 → 정상 결제 검증 처리
    const portonePayment = await this.getPaymentFromPortOne(imp_uid);

    if (portonePayment.status !== 'paid') {
      this.logger.warn(`웹훅: 포트원 상태 불일치 — expected: paid, actual: ${portonePayment.status}`);
      return { message: 'portone status mismatch' };
    }

    // 금액 위변조 검증
    const expectedAmount = Number(payment.amount);
    if (portonePayment.amount !== expectedAmount) {
      this.logger.error(
        `웹훅: 금액 위변조 감지! expected: ${expectedAmount}, actual: ${portonePayment.amount}, impUid: ${imp_uid}`,
      );
      try {
        await this.cancelPaymentOnPortOne(imp_uid, '결제 금액 위변조 감지 (웹훅)');
      } catch (e) {
        this.logger.error(`웹훅: 위변조 건 자동 취소 실패 — ${e instanceof Error ? e.message : e}`);
      }
      return { message: 'amount mismatch - refunded' };
    }

    // 트랜잭션: SELECT FOR UPDATE → 상태 재검증 → 갱신 (verifyPayment 동시 호출 방지)
    const updated = await this.dataSource.transaction(async (manager) => {
      const locked = await manager
        .createQueryBuilder(PaymentEntity, 'p')
        .setLock('pessimistic_write')
        .where('p.id = :id', { id: payment.id })
        .getOne();

      if (!locked) return null;

      // 트랜잭션 내 재검증: verifyPayment가 먼저 처리했을 수 있음
      if (locked.status === PaymentStatus.PAID) {
        return null;
      }

      // 잠금 후 상태가 FAILED/CANCELLED로 변경되었을 수 있음 (Cron 만료)
      if (locked.status === PaymentStatus.FAILED || locked.status === PaymentStatus.CANCELLED) {
        return 'expired' as const;
      }

      await manager.update(PaymentEntity, payment.id, {
        impUid: imp_uid,
        status: PaymentStatus.PAID,
        paymentMethod: portonePayment.pay_method ?? null,
        pgProvider: portonePayment.pg_provider ?? null,
        receiptUrl: portonePayment.receipt_url ?? null,
        paidAt: new Date(portonePayment.paid_at * 1000),
        rawResponse: portonePayment,
      });

      await manager.update(OrderEntity, payment.orderId, {
        status: OrderStatus.PAID,
        paidAt: new Date(portonePayment.paid_at * 1000),
      });

      return 'processed' as const;
    });

    // 잠금 후 만료 감지 → 자동 환불
    if (updated === 'expired') {
      this.logger.warn(`웹훅: 잠금 후 만료/취소 감지 — 자동 환불. impUid: ${imp_uid}`);
      try {
        await this.cancelPaymentOnPortOne(imp_uid, '주문 만료/취소 후 결제 건 자동 환불 (웹훅)');
      } catch (e) {
        this.logger.error(`웹훅: 자동 환불 실패 — ${e instanceof Error ? e.message : e}`);
      }
      return { message: 'refunded - order expired' };
    }

    // 이미 verifyPayment가 처리한 경우 — 이벤트 중복 발행 방지
    if (updated === 'processed') {
      this.eventEmitter.emit(
        'order.paid',
        new OrderPaidEvent(
          payment.orderId,
          payment.order.userId,
          payment.merchantUid,
          imp_uid,
        ),
      );
      this.logger.log(`웹훅: 결제 검증 완료 — merchantUid: ${merchant_uid}`);
    } else {
      this.logger.log(`웹훅: 이미 처리됨 (verifyPayment 선행) — merchantUid: ${merchant_uid}`);
    }

    return { message: 'ok' };
  }
}
