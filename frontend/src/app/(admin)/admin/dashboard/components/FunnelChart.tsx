'use client';

import dynamic from 'next/dynamic';
import { useFunnelQuery } from '../../../../../hooks/useDashboardQuery';
import { useDateRange } from '../../../../../hooks/useDateRange';
import { buildFunnelOption } from '../../../../../lib/charts/funnel';

/**
 * 결제 전환 펀넬 — 5단계 도달률 + 별도 취소 카운트.
 *
 * 코호트 정의:
 *   "기간 안에 createdAt이 든 주문"이 분모. 기간 이후 결제도 같은 코호트로 잡힘.
 *
 * 시각:
 *   - 펀넬 본체: 5단계, sort: 'none' 으로 입력 순서 유지
 *   - 우측 박스: 펀넬에 포함되지 않은 cancelledCount 별도 표시
 *     (cancelled는 단계가 아니라 이탈 결과이므로 펀넬 시각화에서 분리)
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

const cancelBoxStyle: React.CSSProperties = {
  flexShrink: 0,
  width: 140,
  marginLeft: 16,
  padding: '14px 16px',
  background: '#fef2f2',          // red-50
  border: '1px solid #fecaca',    // red-200
  borderRadius: 8,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 6,
};

const cancelLabelStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#991b1b',               // red-800
  fontWeight: 600,
};

const cancelValueStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 700,
  color: '#b91c1c',               // red-700
};

export default function FunnelChart() {
  const { startDate, endDate } = useDateRange();
  const { data, isLoading, isError } = useFunnelQuery({ startDate, endDate });

  return (
    <div style={cardStyle}>
      <div style={{ marginBottom: 12 }}>
        <h2 style={titleStyle}>결제 전환 펀넬</h2>
        <p style={subTitleStyle}>
          {startDate} ~ {endDate} · createdAt 기준 코호트 (기간 이후 결제 포함)
        </p>
      </div>

      {isLoading && (
        <div style={{ height: 320, background: '#f1f5f9', borderRadius: 8 }} />
      )}

      {isError && (
        <div
          style={{
            height: 320,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#dc2626',
            fontSize: 13,
          }}
        >
          차트 데이터를 불러오지 못했습니다.
        </div>
      )}

      {!isLoading && !isError && data && (
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <ReactECharts
              option={buildFunnelOption(data)}
              notMerge
              style={{ height: 320 }}
              opts={{ renderer: 'canvas' }}
            />
          </div>
          <div style={cancelBoxStyle}>
            <span style={cancelLabelStyle}>취소</span>
            <span style={cancelValueStyle}>
              {data.cancelledCount.toLocaleString()}건
            </span>
            <span style={{ fontSize: 11, color: '#7f1d1d' }}>
              status = &apos;cancelled&apos;
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
