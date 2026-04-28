# 관리자 대시보드 — 컨텍스트 인수인계 문서 (Phase 3 → Phase 4)

> 작성일: 2026-04-28
> 목적: Phase 0~3 구현이 완료된 시점에서 다음 컨텍스트로 작업을 이어받기 위한 핵심 정보.
> **참고 문서 (반드시 함께 읽을 것)**:
> - `docs/Design_Dashboard.md` — 설계 청사진 (Phase 0~7 전체 계획, Phase 3까지 수정 반영됨)
> - `docs/Design_Dashboard_Handoff_2.md` — Phase 0~2 인수인계 (패턴/배경 상세)

---

## 0. 빠른 시작 — 다음 컨텍스트에서 첫 발화 예시

```
관리자 대시보드 Phase 4부터 이어서 구현한다. 이전 컨텍스트에서 Phase 0~3 완료.
docs/Design_Dashboard.md (설계 청사진), docs/Design_Dashboard_Handoff_3.md (인수인계) 참조.

다음 작업: Phase 4-B (GET /v1/admin/dashboard/funnel) → Phase 4-C (FunnelChart.tsx, ECharts funnel type).

Phase 1~3과 동일하게:
1. 코드 → 2. 설계 이유 → 3. 대안 비교
한 단계씩 끊어서 진행한다.
```

---

## 1. 현재까지 구현된 것 (Phase 0~3)

### 1.1 Phase 0~2 — 기존 인수인계(Handoff_2.md §1) 참고, 변경 없음

### 1.2 Phase 3 — 보안 차트 (이번 컨텍스트에서 완료)

| 파일 | 역할 |
|------|------|
| `backend/src/admin/dashboard/dto/security-response.dto.ts` | SecurityPointDto + SecurityResponseDto |
| `backend/src/admin/dashboard/dashboard.service.ts` | `getSecurity()` 추가 — SQL + Number 캐스팅 + fillEmptyDates + failureRate 계산 |
| `backend/src/admin/dashboard/dashboard.controller.ts` | `@Get('security')` + `@Serialize(SecurityResponseDto)` 추가 |
| `frontend/src/service/admin-dashboard.ts` | `SecurityPoint`, `SecurityResponse`, `SecurityParams`, `fetchSecurity` 추가 |
| `frontend/src/hooks/useDashboardQuery.ts` | `useSecurityQuery` 추가 (staleTime 5분) |
| `frontend/src/lib/charts/security.ts` | `buildSecurityOption()` 순수 함수 — 이중 Y축 + stacked bar + markLine + 색상 콜백 |
| `frontend/src/app/(admin)/admin/dashboard/components/SecurityChart.tsx` | ECharts 마운트 컴포넌트 |
| `frontend/src/app/(admin)/admin/dashboard/page.tsx` | SecurityChart Suspense 마운트 추가 |

### 1.3 Phase 3에서 발견·수정한 엣지케이스

**문제**: `buildSecurityOption`의 `tooltip.formatter`와 `itemStyle.color` 콜백에서 `data.daily[i]`가 `undefined`일 수 있음.

**원인**: ECharts는 `notMerge=true`로 옵션 교체 중에도 이전 dataIndex로 콜백을 호출할 수 있음. 새 `data`로 빌드된 클로저와 이전 x축 길이가 순간적으로 불일치 시 throw.

**수정**: 두 콜백 모두 null guard 추가.
- `tooltip.formatter`: `if (!p) return ''`
- `itemStyle.color`: `if (!p) return COLOR_BAR_NORMAL`
- 위치: `frontend/src/lib/charts/security.ts`

**동일 패턴 적용 필요**: Phase 4~5 차트 옵션 빌더에도 동일한 null guard를 적용할 것.

---

## 2. 코드베이스에서 발견한 패턴 (반드시 준수)

### 2.1 백엔드 패턴 — Handoff_2.md §2.1과 동일, 추가 사항:

**서비스 처리 순서 (반드시 이 순서로)**:
```
SQL 실행 → Number() 캐스팅 → fillEmptyDates → 파생 값 계산(failureRate 등) → DTO 빌드
```
`fillEmptyDates` 전에 파생 값 계산하면 빈 날짜(0/0)에서 NaN 발생.

**`AuditAction` enum 위치**: `backend/src/audit/entity/audit-log.entity.ts`
- Phase 4는 `orders` 테이블 직접 쿼리 — `AuditAction` 미사용

**SQL aggregate 패턴**:
```ts
// SUM/COUNT는 ::text 캐스팅 후 Number()
SUM(...)::text AS col_name
COUNT(...)::text AS col_name
// 서비스에서
Number(r.col_name)
```

### 2.2 프론트엔드 패턴 — Handoff_2.md §2.2와 동일, 추가 사항:

**ECharts 이중 Y축 패턴** (security에서 확립됨):
```ts
yAxis: [
  { type: 'value', position: 'left' },   // index 0 — bar
  { type: 'value', position: 'right' },  // index 1 — line
],
series: [
  { type: 'bar',  yAxisIndex: 0, ... },
  { type: 'line', yAxisIndex: 1, markLine: { data: [{ yAxis: 임계값 }] }, ... },
]
```

**ECharts 콜백 null guard 필수 패턴** (이번 컨텍스트에서 확립됨):
```ts
// itemStyle.color 콜백
color: (params: any) => {
  const p = data.daily[params.dataIndex];
  if (!p) return FALLBACK_COLOR;  // 필수
  return p.value > THRESHOLD ? ALERT_COLOR : NORMAL_COLOR;
},

// tooltip.formatter 콜백
formatter: (params: any) => {
  const i = (Array.isArray(params) ? params[0] : params).dataIndex;
  const p = data.daily[i];
  if (!p) return '';  // 필수
  return `...`;
},
```

**서비스/훅 추가 위치**:
- 서비스 타입 + fetch: `frontend/src/service/admin-dashboard.ts`
- React Query 훅: `frontend/src/hooks/useDashboardQuery.ts`
- 옵션 빌더: `frontend/src/lib/charts/{name}.ts`
- 컴포넌트: `frontend/src/app/(admin)/admin/dashboard/components/{Name}Chart.tsx`

### 2.3 Vercel 환경변수 — Handoff_2.md §2.3과 동일

---

## 3. 알려진 제약 / 트레이드오프

### 3.1~3.3 — Handoff_2.md §3.1~3.3과 동일 (auth 제약, 카테고리 스냅샷, auditRepo 미주입)

### 3.4 보안 차트 `compareWithPrevious` 미지원 (의도적)

Phase 3에서 의도적으로 제외. 추후 필요 시: `DateRangeQueryDto`에 옵션 추가 → 동일 SQL 재실행 → `previous` 필드 추가.

### 3.5 `validateDateRange` 실제 허용 범위

설계 문서는 "최대 90일"이나 코드는 `diffDays > 91` 체크 → 실제 91일까지 허용됨.
(pre-existing, 전 엔드포인트 동일 — 포트폴리오 수준에서 허용)

### 3.6 Phase 4 전용 — `orders` 직접 쿼리

Phase 4 펀넬은 `audit_logs` 아닌 `orders` 테이블 직접 쿼리.
`DashboardService`는 `orderRepo: Repository<OrderEntity>`만 주입 — 기존 그대로 사용 가능.
`orders` 컬럼명: `createdAt` (camelCase, 쌍따옴표), `paidAt`, `shippedAt`, `deliveredAt`, `completedAt` — **모두 camelCase, 쌍따옴표 필수**.

---

## 4. 다음 작업 (Phase 4 — 결제 전환 펀넬)

### 4.1 Phase 4-B: 백엔드 `GET /v1/admin/dashboard/funnel`

**쿼리 파라미터**: `startDate`, `endDate` (YYYY-MM-DD)
→ `DateRangeQueryDto` 재사용

**핵심 트릭**: PostgreSQL `COUNT(column)`은 NULL 제외. `orders` 한 번 쿼리로 5단계 집계 가능.

**SQL**:
```sql
SELECT
  COUNT(*)::text                                                       AS created,
  COUNT(CASE WHEN status NOT IN ('cancelled','pending_payment') THEN 1 END)::text AS paid_or_after,
  COUNT("paidAt")::text                                                AS paid,
  COUNT("shippedAt")::text                                             AS shipped,
  COUNT("deliveredAt")::text                                           AS delivered,
  COUNT("completedAt")::text                                           AS completed,
  SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)::text         AS cancelled
FROM orders
WHERE "createdAt" >= $1 AND "createdAt" < $2
```

**파라미터**: `[start, endNext]` from `toKstRange(startDate, endDate)` — 재사용 ✓

**코호트 정의**: `createdAt`이 기간 내인 주문에 한해 각 단계 도달률 측정. 기간 이후 결제 등도 이 코호트에 포함.

**서비스에서 파생 계산**:
```ts
const created = Number(row.created);
const rate = (n: number) => created > 0 ? Math.round((n / created) * 1000) / 10 : 0;
const stages = [
  { name: '주문 생성',   count: created,                  rate: 100,          dropRate: 0 },
  { name: '결제 완료',   count: Number(row.paid),          rate: rate(paid),   dropRate: ... },
  { name: '배송 중',     count: Number(row.shipped),       rate: rate(shipped), dropRate: ... },
  { name: '배송 완료',   count: Number(row.delivered),     rate: rate(delivered), dropRate: ... },
  { name: '구매 확정',   count: Number(row.completed),     rate: rate(completed), dropRate: ... },
];
```

**응답 DTO 신규**: `backend/src/admin/dashboard/dto/funnel-response.dto.ts`
```ts
class FunnelStageDto {
  @Expose() name: string;
  @Expose() count: number;
  @Expose() rate: number;      // created 대비 %
  @Expose() dropRate: number;  // 직전 단계 대비 이탈 %
}

export class FunnelResponseDto {
  @Expose() @Type(() => Object) period: { start: string; end: string };
  @Expose() @Type(() => FunnelStageDto) stages: FunnelStageDto[];
  @Expose() cancelledCount: number;
  @Expose() generatedAt: string;
}
```

**컨트롤러**:
```ts
@Get('funnel')
@Serialize(FunnelResponseDto)
getFunnel(@Query() query: DateRangeQueryDto) {
  return this.dashboardService.getFunnel(query);
}
```

### 4.2 Phase 4-C: 프론트 `FunnelChart.tsx`

**ECharts funnel 타입 핵심**:
```ts
series: [{
  type: 'funnel',
  sort: 'none',   // 필수 — 없으면 크기순 자동 정렬되어 단계 순서 깨짐
  left: '10%', width: '80%',
  minSize: '10%', maxSize: '100%',
  gap: 4,
  data: stages.map(s => ({ name: s.name, value: s.rate })),
  label: { formatter: (p) => `${p.name}\n${p.value}%` },
}]
```

**옵션 빌더**: `frontend/src/lib/charts/funnel.ts`에 `buildFunnelOption(data: FunnelResponse): EChartsOption`

**훅/서비스**:
- `fetchFunnel`, `FunnelStage`, `FunnelResponse`, `FunnelParams` → `admin-dashboard.ts` 추가
- `useFunnelQuery` → `useDashboardQuery.ts` 추가 (staleTime 10분)
- queryKey: `['dashboard', 'funnel', startDate, endDate]`

**page.tsx**: SecurityChart 아래 `<FunnelChart />` Suspense 마운트

### 4.3 작업 순서

1. **4-B 먼저** (백엔드 — curl로 응답 확인)
2. **4-C** (`sort: 'none'` 확인 필수)

---

## 5. Phase 5~7 구현 시 참고 사항

### Phase 5 (트리맵 — 카테고리 매출)
- v1: leaf 카테고리 그대로 (root 매핑 없음)
- `products.category_id` JOIN (카테고리 스냅샷 없음 — §3.3 참고)
- `compareWithPrevious` 지원 → `deltaPercent`에 따라 박스 색 4 구간

### Phase 6 (확장 UX)
- DataFreshness — `generatedAt` + 5초 폴링 훅
- 차트 클릭 드릴다운 — ECharts `onClick` → `router.push('/admin/audit-logs?...')`
- CSV — 별도 `.csv` 엔드포인트 (Content-Type: text/csv)

### Phase 7 (성능)
- orders 인덱스 3개 추가 (Design_Dashboard.md §10.1)
- Redis 캐싱 — TTL 차등 (§10.2). `redis.get/set` 명시 호출 권장 (디버깅 용이)

---

## 6. 동작 확인 / 디버깅 팁

### 6.1 백엔드 단독 테스트
```bash
npx nx serve backend

# KPI
curl -H "Authorization: Bearer <AT>" http://localhost:4000/v1/admin/dashboard/kpi

# order-trend (7일)
curl -H "Authorization: Bearer <AT>" \
  "http://localhost:4000/v1/admin/dashboard/order-trend?startDate=2026-04-21&endDate=2026-04-27"

# security (Phase 3 완료)
curl -H "Authorization: Bearer <AT>" \
  "http://localhost:4000/v1/admin/dashboard/security?startDate=2026-04-21&endDate=2026-04-27"

# funnel (Phase 4)
curl -H "Authorization: Bearer <AT>" \
  "http://localhost:4000/v1/admin/dashboard/funnel?startDate=2026-04-01&endDate=2026-04-27"
```

### 6.2 프론트 진입
1. `npx nx serve frontend` → http://localhost:3000
2. ADMIN 계정으로 로그인
3. http://localhost:3000/admin → `/admin/dashboard` 자동 리다이렉트
4. 필터 조작 → URL 쿼리스트링 변경 → 모든 차트 자동 refetch

### 6.3 보안 차트 검증 포인트
- 7d/30d 토글 시 SecurityChart refetch 확인 (queryKey에 날짜 포함)
- 실패율 > 10%인 날 막대 빨강 변경 확인
- markLine 10% 빨강 점선 — 오른쪽 Y축(실패율) 기준 표시 확인
- data.daily 전체 0인 경우 빈 차트 + markLine만 표시 확인

### 6.4 인증 흐름 체크리스트 — Handoff_2.md §6.3과 동일

### 6.5 타입 체크
```bash
# 백엔드 (pre-existing 에러 다수 — admin/dashboard 관련 에러만 확인)
cd backend && npx tsc -p tsconfig.app.json --noEmit

# 프론트 (0 에러 확인됨)
cd frontend && npx tsc --noEmit
```

---

## 7. 절대 변경하면 안 되는 것

1. **기존 auth 흐름**: `auth-storage.ts`, `auth-channel.ts`, `axios-http-client.ts` 인터셉터 로직
2. **AuditAction enum**: 추가 가능, 기존 값 변경 금지
3. **Role enum 값**: `'admin'` (소문자)
4. **`(main)/admin/` 폴더**: 삭제됨. 부활 금지
5. **next.config.js의 `rewrites()`**: 일반 API 호출 핵심 경로
6. **AdminGuard.tsx의 로컬 `MeResponse`**: shared `UserProfileResponse.roles: string[]` 아님. 실제 응답은 `{ name: string }[]`
7. **`buildSecurityOption`의 null guard**: `if (!p) return ''` / `if (!p) return COLOR_BAR_NORMAL` — 제거 금지 (ECharts 옵션 교체 중 dataIndex 불일치 방지)

---

## 8. 메모리에 저장된 사용자 컨텍스트

- 신입 백엔드 개발자, 포트폴리오용
- 한국어 소통, 과한 추상화 금지
- 라이브러리는 학습 곡선 낮은 것 우선 (차트는 ECharts로 통일)
- 외부 도구 도입 금지 (ELK, Datadog 등)
- "1. 코드 → 2. 설계 이유 → 3. 대안 비교" 순서 준수

---

**END OF HANDOFF**
