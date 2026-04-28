import { Suspense } from 'react';
import KpiCards from './components/KpiCards';
import DashboardFilters from './components/DashboardFilters';
import OrderTrendChart from './components/OrderTrendChart';
import SecurityChart from './components/SecurityChart';
import FunnelChart from './components/FunnelChart';

export default function AdminDashboardPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <header>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>
          대시보드
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
          오늘의 주요 운영 지표 한눈에 보기
        </p>
      </header>

      {/*
        Suspense 경계 — useSearchParams를 쓰는 컴포넌트는 Next.js 15에서
        Suspense로 감싸지 않으면 빌드 경고가 발생할 수 있음.
      */}
      <Suspense fallback={<div style={{ height: 56 }} />}>
        <DashboardFilters />
      </Suspense>

      <KpiCards />

      <Suspense fallback={<div style={{ height: 360 }} />}>
        <OrderTrendChart />
      </Suspense>

      <Suspense fallback={<div style={{ height: 360 }} />}>
        <SecurityChart />
      </Suspense>

      <Suspense fallback={<div style={{ height: 360 }} />}>
        <FunnelChart />
      </Suspense>

      {/*
        Phase 5 차트 슬롯:
        - CategoryRevenueChart (트리맵)
      */}
    </div>
  );
}
