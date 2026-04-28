import { authClient } from '../lib/axios/axios-http-client';

// ──────────────────────────────────────────────
// 응답 타입 (백엔드 *ResponseDto와 1:1 매칭)
// ──────────────────────────────────────────────
export interface KpiResponse {
  todayOrders:      { value: number; deltaPercent: number };
  todayRevenue:     { value: number; deltaPercent: number };
  pendingShipments: { value: number };
  loginFailureRate: { value: number; threshold: number };
  generatedAt:      string;
}

export interface OrderTrendPoint {
  date:      string;  // 'YYYY-MM-DD' (KST)
  ordered:   number;
  paid:      number;
  cancelled: number;
}

export interface OrderTrendResponse {
  current:    OrderTrendPoint[];
  previous?:  OrderTrendPoint[];
  generatedAt: string;
}

export interface OrderTrendParams {
  startDate: string;
  endDate:   string;
  compareWithPrevious: boolean;
}

// ──────────────────────────────────────────────
// API 호출
// ──────────────────────────────────────────────
export async function fetchKpi() {
  return authClient.get<KpiResponse>('/admin/dashboard/kpi');
}

export async function fetchOrderTrend(params: OrderTrendParams) {
  // boolean → 'true'/'false' 문자열 (DTO @IsBooleanString 호환)
  return authClient.get<OrderTrendResponse>('/admin/dashboard/order-trend', {
    params: {
      startDate: params.startDate,
      endDate:   params.endDate,
      compareWithPrevious: params.compareWithPrevious ? 'true' : 'false',
    },
  });
}

// ──────────────────────────────────────────────
// Security (보안 차트)
// ──────────────────────────────────────────────
export interface SecurityPoint {
  date:        string;   // 'YYYY-MM-DD' (KST)
  failed:      number;   // FAILED_LOGIN 건수
  locked:      number;   // ACCOUNT_LOCKED 건수
  total:       number;   // success + failed (로그인 시도 총수)
  failureRate: number;   // 0~100, 소수 1자리
}

export interface SecurityResponse {
  daily:       SecurityPoint[];
  generatedAt: string;
}

export interface SecurityParams {
  startDate: string;
  endDate:   string;
}

export async function fetchSecurity(params: SecurityParams) {
  return authClient.get<SecurityResponse>('/admin/dashboard/security', { params });
}

// ──────────────────────────────────────────────
// Funnel (결제 전환 펀넬)
// ──────────────────────────────────────────────
/**
 * 백엔드 FunnelStageDto와 1:1.
 * - rate: 1단계(주문 생성) 대비 도달률 (0~100, 소수 1자리)
 * - dropRate: 직전 단계 대비 이탈률 (0~100, 소수 1자리). 1단계는 0.
 */
export interface FunnelStage {
  name:     string;
  count:    number;
  rate:     number;
  dropRate: number;
}

export interface FunnelResponse {
  period: { start: string; end: string };
  stages: FunnelStage[];        // 항상 5개 (주문 생성 → ... → 구매 확정)
  cancelledCount: number;
  generatedAt:    string;
}

export interface FunnelParams {
  startDate: string;
  endDate:   string;
}

export async function fetchFunnel(params: FunnelParams) {
  return authClient.get<FunnelResponse>('/admin/dashboard/funnel', { params });
}
