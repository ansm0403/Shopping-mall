import type { EChartsOption } from 'echarts';
import type { FunnelResponse } from '@/service/admin-dashboard';

/**
 * 단계별 색 — 단계가 진행될수록 진해지는 단조 그라디언트.
 * (각 단계의 의미가 ECharts default palette보다 직관적으로 읽힘)
 * 가장 어두운 색이 "구매 확정"에 가도록 위에서 아래로 진해짐.
 */
const STAGE_COLORS = [
  '#bfdbfe', // sky-200  — 주문 생성
  '#93c5fd', // sky-300  — 결제 완료
  '#60a5fa', // sky-400  — 배송 중
  '#3b82f6', // sky-500  — 배송 완료
  '#1d4ed8', // sky-700  — 구매 확정
];

/**
 * GET /v1/admin/dashboard/funnel 응답을 ECharts 옵션으로 변환.
 *
 * 핵심:
 * 1) `sort: 'none'` — 없으면 ECharts가 value 큰 순서로 자동 정렬해 단계 순서 깨짐.
 *    (펀넬은 입력 순서가 곧 단계 순서)
 * 2) `data[i].value`는 rate(%) 사용 — count 자체보다 도달률이 시각적 의미가 큼.
 *    실제 건수는 tooltip / label에서 함께 표시.
 * 3) tooltip.formatter / label.formatter 콜백은 null guard 필수
 *    (ECharts 옵션 교체 중 이전 dataIndex로 콜백이 호출되는 케이스 방어 — security 차트와 동일 패턴)
 */
export function buildFunnelOption(data: FunnelResponse): EChartsOption {
  const stages = data.stages;

  return {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const i = params.dataIndex;
        const s = stages[i];
        if (!s) return '';
        // 1단계는 dropRate 없음 → 표시 분기
        const dropLine =
          i === 0
            ? ''
            : `<br/>직전 대비 이탈: <b>${s.dropRate}%</b>`;
        return [
          `<b>${s.name}</b>`,
          `도달: <b>${s.count.toLocaleString()}건</b>`,
          `1단계 대비: <b>${s.rate}%</b>${dropLine}`,
        ].join('<br/>');
      },
    },
    legend: { show: false },
    series: [
      {
        type: 'funnel',
        // sort: 'none' 빠지면 단계 순서가 망가짐 — Phase 4 최대 함정
        sort: 'none',
        // 가로 위치/너비 — 카드 좌우 여백과 시각적 균형
        left: '5%',
        width: '90%',
        // 가장 좁은 단계가 화면에서 사라지지 않도록 minSize 보장
        minSize: '15%',
        maxSize: '100%',
        gap: 4,
        // value는 rate(%) — 시각적 너비가 도달률을 그대로 반영
        data: stages.map((s, i) => ({
          name:  s.name,
          value: s.rate,
          itemStyle: { color: STAGE_COLORS[i] ?? STAGE_COLORS[STAGE_COLORS.length - 1] },
        })),
        label: {
          show: true,
          position: 'inside',
          color: '#0f172a',
          fontSize: 12,
          fontWeight: 600,
          formatter: (params: any) => {
            const i = params.dataIndex;
            const s = stages[i];
            if (!s) return '';
            // "주문 생성\n412건 (100%)" 형식
            return `${s.name}\n${s.count.toLocaleString()}건 (${s.rate}%)`;
          },
        },
        labelLine: { show: false },
      },
    ],
  };
}
