'use client';

import dynamic from 'next/dynamic';
import { useOrderTrendQuery } from '../../../../../hooks/useDashboardQuery';
import { useDateRange } from '../../../../../hooks/useDateRange';
import { buildOrderTrendOption } from '../../../../../lib/charts/order-trend';

/**
 * 일별 주문/결제 꺾은선 차트.
 *
 * - 'use client' 필수 (useSearchParams + ECharts canvas)
 * - dynamic({ ssr: false }): ECharts는 window/canvas에 의존 → 서버 번들에서 제외하여 SSR 에러 차단
 * - URL 쿼리 변경 → useDateRange가 새 값 → useOrderTrendQuery의 queryKey 변경 → 자동 refetch
 * - notMerge=true: compare 토글로 시리즈 개수가 변할 때 이전 시리즈 잔존 방지
 */

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: '12px',
  padding: '20px',
  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
};

const titleStyle: React.CSSProperties = {
  margin: '0 0 8px',
  fontSize: '15px',
  fontWeight: 700,
  color: '#0f172a',
};

const subTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '12px',
  color: '#64748b',
};

const headerStyle: React.CSSProperties = {
  marginBottom: '12px',
};

export default function OrderTrendChart() {
  const { startDate, endDate, compareWithPrevious } = useDateRange();
  const { data, isLoading, isError } = useOrderTrendQuery({
    startDate,
    endDate,
    compareWithPrevious,
  });

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <h2 style={titleStyle}>일별 주문 / 결제</h2>
        <p style={subTitleStyle}>
          {startDate} ~ {endDate}
          {compareWithPrevious && ' · 전기 비교 활성'}
        </p>
      </div>

      {isLoading && (
        <div style={{ height: 320, background: '#f1f5f9', borderRadius: 8 }} />
      )}

      {isError && (
        <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', fontSize: 13 }}>
          차트 데이터를 불러오지 못했습니다.
        </div>
      )}

      {!isLoading && !isError && data && (
        <ReactECharts
          option={buildOrderTrendOption(data)}
          notMerge
          style={{ height: 320 }}
          opts={{ renderer: 'canvas' }}
        />
      )}
    </div>
  );
}
