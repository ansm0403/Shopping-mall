import { Expose, Type } from 'class-transformer';

/**
 * 일별 주문/결제 한 점.
 * 백엔드는 fillEmptyDates로 빈 날짜까지 0으로 채워 일정 길이 배열 보장.
 */
class OrderTrendPointDto {
  @Expose() date: string;        // 'YYYY-MM-DD' (KST)
  @Expose() ordered: number;     // ORDER_CREATED & success
  @Expose() paid: number;        // PAYMENT_VERIFIED & success
  @Expose() cancelled: number;   // ORDER_CANCELLED & success
}

/**
 * GET /v1/admin/dashboard/order-trend 응답.
 * - current: 항상 존재
 * - previous: compareWithPrevious=true 일 때만 (current와 동일 길이)
 * - generatedAt: 서버가 응답을 생성한 시각 (Phase 6 DataFreshness에서 사용)
 */
export class OrderTrendResponseDto {
  @Expose()
  @Type(() => OrderTrendPointDto)
  current: OrderTrendPointDto[];

  @Expose()
  @Type(() => OrderTrendPointDto)
  previous?: OrderTrendPointDto[];

  @Expose()
  generatedAt: string;
}
