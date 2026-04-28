import { Expose, Type } from 'class-transformer';

/**
 * 펀넬 한 단계.
 * - count: 그 단계까지 도달한 주문 수
 * - rate: 1단계(주문 생성) 대비 도달률 (%, 소수 1자리). 1단계는 항상 100.
 * - dropRate: 직전 단계 대비 이탈률 (%, 소수 1자리). 1단계는 0.
 *   ex) 결제완료 단계의 dropRate = (created - paid) / created * 100
 */
class FunnelStageDto {
  @Expose() name:     string;
  @Expose() count:    number;
  @Expose() rate:     number;
  @Expose() dropRate: number;
}

/** 펀넬에 포함되지 않은 부가 정보(취소 카운트)는 별도 필드로 노출. */
class FunnelPeriodDto {
  @Expose() start: string;  // 'YYYY-MM-DD'
  @Expose() end:   string;  // 'YYYY-MM-DD'
}

/**
 * GET /v1/admin/dashboard/funnel 응답.
 * - period: 요청한 기간을 그대로 echo (프론트에서 차트 부제 표시용)
 * - stages: 5단계 고정 (주문 생성 → 결제 완료 → 배송 중 → 배송 완료 → 구매 확정)
 * - cancelledCount: 펀넬 외 취소 주문 수 (코호트 전체 중 'cancelled' 상태)
 * - generatedAt: 서버 응답 생성 시각 (Phase 6 DataFreshness용)
 */
export class FunnelResponseDto {
  @Expose()
  @Type(() => FunnelPeriodDto)
  period: FunnelPeriodDto;

  @Expose()
  @Type(() => FunnelStageDto)
  stages: FunnelStageDto[];

  @Expose()
  cancelledCount: number;

  @Expose()
  generatedAt: string;
}
