'use client';

import { useQuery } from '@tanstack/react-query';
import {
  fetchKpi,
  fetchOrderTrend,
  fetchSecurity,
  fetchFunnel,
  KpiResponse,
  OrderTrendParams,
  OrderTrendResponse,
  SecurityParams,
  SecurityResponse,
  FunnelParams,
  FunnelResponse,
} from '../service/admin-dashboard';

/**
 * 대시보드 차트 공통 React Query 옵션.
 * - refetchOnWindowFocus false: 운영자가 의도적으로 새로고침할 때만 갱신
 * - staleTime은 차트별로 다름 (Design_Dashboard.md §10.2 캐싱 TTL 차등)
 */

const NO_FOCUS_REFETCH = { refetchOnWindowFocus: false } as const;

export function useKpiQuery() {
  return useQuery<KpiResponse>({
    queryKey: ['dashboard', 'kpi'],
    queryFn: async () => {
      const res = await fetchKpi();
      return res.data;
    },
    staleTime: 60 * 1000, // KPI는 짧게 (1분)
    ...NO_FOCUS_REFETCH,
  });
}

/**
 * 일별 주문/결제 트렌드.
 * - queryKey에 startDate/endDate/compareWithPrevious 모두 포함 → URL 변경 시 자동 refetch
 * - staleTime 5분 (트렌드는 자주 바뀌지 않음)
 * - enabled: 두 날짜가 있을 때만 (필수지만 안전장치)
 */
export function useOrderTrendQuery(params: OrderTrendParams) {
  return useQuery<OrderTrendResponse>({
    queryKey: [
      'dashboard',
      'order-trend',
      params.startDate,
      params.endDate,
      params.compareWithPrevious,
    ],
    queryFn: async () => {
      const res = await fetchOrderTrend(params);
      return res.data;
    },
    enabled: Boolean(params.startDate && params.endDate),
    staleTime: 5 * 60 * 1000,
    ...NO_FOCUS_REFETCH,
  });
}

export function useSecurityQuery(params: SecurityParams) {
  return useQuery<SecurityResponse>({
    queryKey: ['dashboard', 'security', params.startDate, params.endDate],
    queryFn: async () => {
      const res = await fetchSecurity(params);
      return res.data;
    },
    enabled: Boolean(params.startDate && params.endDate),
    staleTime: 5 * 60 * 1000,
    ...NO_FOCUS_REFETCH,
  });
}

/**
 * 결제 전환 펀넬.
 * - staleTime 10분 — orders 상태 전이가 분 단위로 잦지 않음 (Design_Dashboard.md §10.2)
 * - queryKey에 startDate/endDate 포함 → 필터 변경 시 자동 refetch
 */
export function useFunnelQuery(params: FunnelParams) {
  return useQuery<FunnelResponse>({
    queryKey: ['dashboard', 'funnel', params.startDate, params.endDate],
    queryFn: async () => {
      const res = await fetchFunnel(params);
      return res.data;
    },
    enabled: Boolean(params.startDate && params.endDate),
    staleTime: 10 * 60 * 1000,
    ...NO_FOCUS_REFETCH,
  });
}
