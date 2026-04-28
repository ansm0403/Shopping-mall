'use client';

import dynamic from 'next/dynamic';
import { useSecurityQuery } from '../../../../../hooks/useDashboardQuery';
import { useDateRange } from '../../../../../hooks/useDateRange';
import { buildSecurityOption } from '../../../../../lib/charts/security';

/**
 * 로그인 보안 차트 (이중 Y축: 건수 Bar + 실패율 Line).
 *
 * - 왼쪽 Y축: 로그인 실패 + 계정 잠금 (stacked bar)
 * - 오른쪽 Y축: 실패율% (line + markLine 10% 경고선)
 * - 임계 초과 날 실패 막대: 빨강 강조
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

export default function SecurityChart() {
  const { startDate, endDate } = useDateRange();
  const { data, isLoading, isError } = useSecurityQuery({ startDate, endDate });

  return (
    <div style={cardStyle}>
      <div style={{ marginBottom: 12 }}>
        <h2 style={titleStyle}>로그인 보안</h2>
        <p style={subTitleStyle}>
          {startDate} ~ {endDate} · 실패율 10% 초과 시 경고
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
          option={buildSecurityOption(data)}
          notMerge
          style={{ height: 320 }}
          opts={{ renderer: 'canvas' }}
        />
      )}
    </div>
  );
}
