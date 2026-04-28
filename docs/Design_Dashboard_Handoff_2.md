# 관리자 대시보드 — 컨텍스트 인수인계 문서 (Phase 2 → Phase 3)

> 작성일: 2026-04-28
> 목적: Phase 0~2 구현이 완료된 시점에서 다음 컨텍스트로 작업을 이어받기 위한 핵심 정보.
> **참고 문서 (반드시 함께 읽을 것)**:
> - `docs/Design_Dashboard.md` — 설계 청사진 (Phase 0~7 전체 계획)
> - `docs/Design_Dashboard_log.md` / `Design_Dashboard_log2.md` — 사전 설계 논의 로그
> - `docs/Design_Dashboard_Handoff_1.md` — Phase 0~1 인수인계 (패턴/배경 상세)

---

## 0. 빠른 시작 — 다음 컨텍스트에서 첫 발화 예시

```
관리자 대시보드 Phase 3부터 이어서 구현한다. 이전 컨텍스트에서 Phase 0~2 완료.
docs/Design_Dashboard.md (설계 청사진), docs/Design_Dashboard_Handoff_2.md (인수인계) 참조.

다음 작업: Phase 3-B (GET /v1/admin/dashboard/security) → Phase 3-C (SecurityChart.tsx, 이중 Y축).

Phase 1~2와 동일하게:
1. 코드 → 2. 설계 이유 → 3. 대안 비교
한 단계씩 끊어서 진행한다.
```

---

## 1. 현재까지 구현된 것 (Phase 0~2)

### 1.1 Phase 0 — 환경 정리 (기존과 동일)

| 파일 | 역할 |
|------|------|
| `frontend/src/middleware.ts` | `/admin/*`에서 refreshToken 쿠키 존재만 체크 |
| `frontend/src/app/api/auth/login/route.ts` | BFF: 로그인 → refreshToken 쿠키 재발급 |
| `frontend/src/app/api/auth/logout/route.ts` | BFF: 로그아웃 → refreshToken 쿠키 삭제 |
| `frontend/src/app/api/auth/refresh/route.ts` | BFF: 토큰 갱신 → 새 refreshToken 재발급 |
| `frontend/src/app/api/auth/_lib/cookie.ts` | Set-Cookie 파싱 헬퍼 |
| `frontend/src/app/(admin)/admin/components/AdminSidebar.tsx` | 사이드바 (인라인 스타일) — 7개 메뉴 |
| `frontend/src/app/(admin)/admin/page.tsx` | `/admin` → `/admin/dashboard` 리다이렉트 |

**주의**: 기존 `frontend/src/app/(main)/admin/` 폴더는 **완전히 삭제됨**.

### 1.2 Phase 0 — 인증 레이어 (Phase 2에서 수정됨)

| 파일 | 현재 상태 | 변경 이유 |
|------|----------|----------|
| `frontend/src/app/(admin)/layout.tsx` | 서버 검증 **삭제** → 셸만 렌더 | §3.1 참고 — SC가 Set-Cookie 불가, 토큰 rotation DoS 유발 |
| `frontend/src/app/(admin)/admin/components/AdminGuard.tsx` | **신규** — Client Component | `'use client'` + React Query로 `/auth/me` 호출 + roles 검증 |

**현재 3중 방어 구조:**
1. `middleware.ts` — refreshToken 쿠키 존재 체크 (UX 빠른 차단)
2. `AdminGuard.tsx` (Client) — `/auth/me` 호출 + `roles[].name === 'admin'` 검증 (UX)
3. 백엔드 `RolesGuard` — JWT + Role 검증 (진실 원천)

### 1.3 Phase 1 — KPI 카드

| 파일 | 역할 |
|------|------|
| `backend/src/admin/admin.module.ts` | TypeORM(OrderEntity, AuditLogEntity) + AuthModule |
| `backend/src/admin/dashboard/dashboard.controller.ts` | `@Controller('admin/dashboard')` + ADMIN 가드 |
| `backend/src/admin/dashboard/dashboard.service.ts` | KPI raw SQL (6개 서브쿼리) + order-trend |
| `backend/src/admin/dashboard/helpers/time-range.helper.ts` | KST 변환 / delta% / 날짜 헬퍼 전체 |
| `backend/src/admin/dashboard/dto/date-range-query.dto.ts` | DateRangeQueryDto, OrderTrendQueryDto |
| `backend/src/admin/dashboard/dto/kpi-response.dto.ts` | KpiResponseDto |
| `backend/src/app/app.module.ts` | AdminModule 등록 |
| `frontend/src/service/admin-dashboard.ts` | fetchKpi + fetchOrderTrend + 타입 |
| `frontend/src/hooks/useDashboardQuery.ts` | useKpiQuery / useOrderTrendQuery |
| `frontend/src/app/(admin)/admin/dashboard/components/KpiCards.tsx` | 4 카드 |

### 1.4 Phase 2 — 일별 주문/결제 꺾은선 차트

| 파일 | 역할 |
|------|------|
| `backend/src/admin/dashboard/dto/order-trend-response.dto.ts` | OrderTrendResponseDto (신규) |
| `backend/src/admin/dashboard/helpers/time-range.helper.ts` | `addDays`, `daysBetweenInclusive`, `getPreviousPeriod`, `fillEmptyDates` 추가 |
| `frontend/src/hooks/useDateRange.ts` | `todayKst()`, `addDays()`, `useDateRange()` (URL → DateRange) |
| `frontend/src/lib/charts/order-trend.ts` | `buildOrderTrendOption()` — ECharts 순수 함수 |
| `frontend/src/app/(admin)/admin/dashboard/components/DashboardFilters.tsx` | 7d/30d 버튼, date picker, compare 토글 (URL이 진실) |
| `frontend/src/app/(admin)/admin/dashboard/components/OrderTrendChart.tsx` | ECharts 꺾은선, `dynamic({ ssr: false })` |
| `frontend/src/app/(admin)/admin/dashboard/page.tsx` | Suspense 경계 + DashboardFilters + OrderTrendChart 마운트 |

### 1.5 라이브러리

- `frontend/package.json`: `echarts ^5.5.1`, `echarts-for-react ^3.0.2` 설치 완료

---

## 2. 코드베이스에서 발견한 패턴 (반드시 준수)

### 2.1 백엔드 패턴

**컨트롤러 라우팅 — 수정된 사실**:
- `@Controller('admin/dashboard')` — `v1/` 접두사 없음
- `main.ts`의 `setGlobalPrefix('v1')`이 자동으로 `/v1/admin/dashboard` 로 만들어줌
- **`@Controller('v1/admin/dashboard')`로 쓰면 `/v1/v1/admin/dashboard`가 됨 → 절대 금지**
- 설계 문서(Design_Dashboard.md)에는 `GET /v1/...`로 적혀있지만 이는 최종 URL이고 컨트롤러 선언은 `'admin/dashboard'`

**Serialize 인터셉터**: `@Serialize(DtoClass)` — ClassSerializerInterceptor 위에서 동작. 응답 DTO는 반드시 명시.

**ADMIN 가드 패턴**:
```ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
```
컨트롤러 클래스 레벨에 걸면 모든 핸들러 자동 적용.

**Role 값**: `Role.ADMIN = 'admin'` (소문자).

**ValidationPipe**: 글로벌 등록됨 (`transform: true`). DTO class-validator 데코레이터만 붙이면 자동 검증.

**raw SQL**: `repo.query(sql, params)` — Postgres `$1, $2, ...` placeholder. `numeric` 컬럼은 문자열로 오므로 `Number()` 캐스팅 필수. `"createdAt"` 처럼 camelCase 컬럼명은 반드시 쌍따옴표로 감쌀 것.

**KST GROUP BY**: `AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul'` 이중 캐스트 필수. UTC로 GROUP BY하면 한국 자정과 9시간 어긋남.

**`fillEmptyDates` 위치**: `backend/src/admin/dashboard/helpers/time-range.helper.ts`에 이미 구현됨. Phase 3에서 그대로 재사용.

### 2.2 프론트엔드 패턴

**axios 클라이언트**:
- `authClient`: Authorization 헤더 자동 + 401 시 자동 refresh + Set-Cookie 브라우저 자동 처리
- `baseURL = NEXT_PUBLIC_API_URL` (로컬 dev: `http://localhost:4000/v1`)

**URL이 상태 진실 원천**: 필터는 `useSearchParams()` 읽기 + `router.push()` 쓰기. `useState`로 날짜 범위 관리 금지.

**React Query queryKey**: 날짜/파라미터를 모두 포함 → URL 변경 시 자동 refetch.

**ECharts 사용 패턴**:
```ts
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false }); // SSR 차단
<ReactECharts option={buildXxxOption(data)} notMerge style={{ height: 320 }} opts={{ renderer: 'canvas' }} />
```
- `notMerge={true}` 필수: 시리즈 개수가 바뀔 때(compare 토글) 이전 시리즈 잔존 방지
- 옵션 빌더는 `frontend/src/lib/charts/` 아래 순수 함수로 분리

**훅 추가 위치**: `frontend/src/hooks/useDashboardQuery.ts` — Phase 3용 `useSecurityQuery` 여기에 추가.

**서비스 추가 위치**: `frontend/src/service/admin-dashboard.ts` — `fetchSecurity` + `SecurityResponse` 타입 여기에 추가.

### 2.3 Vercel 배포 환경변수 (사용자가 이미 설정함)

- `NEXT_PUBLIC_API_URL=/api` (브라우저 → Vercel rewrites → EC2)
- `API_PROXY_TARGET=http://[퍼블릭IP]:4000/v1`

---

## 3. 알려진 제약 / 트레이드오프

### 3.1 (admin) Server Component 인증 제약 — **Phase 2에서 해결됨**

**발견된 버그**: 새로고침 시 `/login?redirect=...`으로 루프 이동.

**근본 원인**:
- 기존 `(admin)/layout.tsx` (Server Component)가 직접 `/auth/refresh`를 호출
- Server Component는 `cookies().set()` 불가 → 백엔드가 내려준 회전된 새 refreshToken을 브라우저 쿠키에 반영 못함
- 다음 요청은 이미 무효화된 이전 토큰 사용 → 백엔드 reuse detection 발동 → `revokeAllUserTokens` → 모든 세션 invalidate → 401 → redirect

**해결책**:
- `(admin)/layout.tsx`에서 서버사이드 인증 코드 **완전 제거**
- `AdminGuard.tsx` (Client Component) 신규 작성 — axios가 refresh 응답의 Set-Cookie를 브라우저가 자동 처리
- 단, `MeResponse` 타입을 AdminGuard 내부에 local interface로 정의 (shared 타입의 `roles: string[]`와 실제 응답 `roles: [{ name: string }]`이 불일치 — class 변환 방식 차이)

**결론**: Server Component에서 token rotation이 있는 엔드포인트를 절대 호출하지 말 것.

### 3.2 카테고리 스냅샷 부재

Phase 5 트리맵은 `products.category_id`로 JOIN. 주문 후 상품 카테고리 변경 시 과거 매출이 새 카테고리로 잡힘. 포트폴리오 수준에서 허용.

### 3.3 Phase 1-B에서 auditRepo 의도적 미주입

DashboardService는 `orderRepo.query()`로 audit_logs까지 조회 가능 (같은 connection). Phase 3에서도 추가 주입 불필요 — 기존 패턴 그대로 `this.orderRepo.query()` 사용.

### 3.4 KPI / order-trend `generatedAt` 미사용

프론트는 현재 미사용. Phase 6의 DataFreshness 컴포넌트에서 활용 예정.

---

## 4. 다음 작업 (Phase 3 — 보안 차트)

### 4.1 Phase 3-B: 백엔드 `GET /v1/admin/dashboard/security`

**쿼리 파라미터**: `startDate`, `endDate` (YYYY-MM-DD)
→ `DateRangeQueryDto` 재사용 (compareWithPrevious 없음)

**SQL** (Design_Dashboard.md §7.2 Chart 2):
```sql
SELECT
  TO_CHAR(("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul')::date, 'YYYY-MM-DD') AS date,
  SUM(CASE WHEN action = 'LOGIN'          AND success THEN 1 ELSE 0 END)::text AS success,
  SUM(CASE WHEN action = 'FAILED_LOGIN'                THEN 1 ELSE 0 END)::text AS failed,
  SUM(CASE WHEN action = 'ACCOUNT_LOCKED'              THEN 1 ELSE 0 END)::text AS locked
FROM audit_logs
WHERE "createdAt" >= $1 AND "createdAt" < $2
  AND action IN ('LOGIN','FAILED_LOGIN','ACCOUNT_LOCKED')
GROUP BY 1
ORDER BY 1 ASC
```

**서비스에서 파생 계산**:
```ts
const failureRate = failed / (success + failed) * 100; // 0~100
const total       = success + failed;
```
`failureRate`는 SQL에서 계산 가능하나 서비스에서 계산하면 `fillEmptyDates` 기본값 설정이 더 단순 (0으로 채우기).

**헬퍼 재사용**:
- `toKstRange(startDate, endDate)` — 이미 있음 ✓
- `validateDateRange()` — 이미 있음 ✓
- `fillEmptyDates()` — 이미 있음 ✓, `defaults: { success: 0, failed: 0, locked: 0 }`

**응답 DTO 신규 작성**: `backend/src/admin/dashboard/dto/security-response.dto.ts`
```ts
class SecurityPointDto {
  @Expose() date: string;
  @Expose() failed: number;
  @Expose() locked: number;
  @Expose() total: number;        // success + failed
  @Expose() failureRate: number;  // 소수 1자리 (0~100)
}

export class SecurityResponseDto {
  @Expose()
  @Type(() => SecurityPointDto)
  daily: SecurityPointDto[];

  @Expose() generatedAt: string;
}
```

**서비스 메서드**: `dashboardService.getSecurity(query: DateRangeQueryDto)` 신규
**컨트롤러 메서드**:
```ts
@Get('security')
@Serialize(SecurityResponseDto)
getSecurity(@Query() query: DateRangeQueryDto) {
  return this.dashboardService.getSecurity(query);
}
```

### 4.2 Phase 3-C: 프론트 `SecurityChart.tsx` (이중 Y축)

**위치**: `frontend/src/app/(admin)/admin/dashboard/components/SecurityChart.tsx`

**특이점 — 이중 Y축 ECharts 설정**:
```ts
yAxis: [
  { type: 'value', name: '건수', position: 'left' },   // index 0: Bar
  { type: 'value', name: '실패율(%)', position: 'right', min: 0, max: 100 }, // index 1: Line
]
series: [
  { name: '로그인 실패', type: 'bar', yAxisIndex: 0, ... },
  { name: '잠금', type: 'bar', yAxisIndex: 0, stack: 'security', ... },
  {
    name: '실패율',
    type: 'line',
    yAxisIndex: 1,           // 오른쪽 Y축
    markLine: {
      data: [{ yAxis: 10 }], // 10% 경고선
      lineStyle: { color: '#dc2626', type: 'dashed' },
    },
    ...
  },
]
```

**임계선 초과 날 막대 색상 함수**:
```ts
itemStyle: {
  color: (params) => {
    const point = data.daily[params.dataIndex];
    return point.failureRate > 10 ? '#dc2626' : '#f97316'; // red / orange
  }
}
```

**옵션 빌더**: `frontend/src/lib/charts/security.ts`에 순수 함수 `buildSecurityOption(data: SecurityResponse): EChartsOption` 작성.

**훅**: `useDashboardQuery.ts`에 `useSecurityQuery(params: SecurityParams)` 추가
- queryKey: `['dashboard', 'security', startDate, endDate]`
- staleTime: 5 × 60 × 1000

**서비스**: `admin-dashboard.ts`에 `fetchSecurity`, `SecurityPoint`, `SecurityResponse`, `SecurityParams` 추가

**page.tsx 수정**: `<OrderTrendChart />` 아래에 `<SecurityChart />` Suspense로 감싸서 추가

1. **3-B 먼저** (백엔드 — curl로 응답 확인)
2. **3-C** (프론트 — 차트 렌더링 + markLine 동작 확인)

---

## 5. Phase 4~7 구현 시 참고 사항

### Phase 4 (펀넬 — 코호트)
- orders 단일 쿼리 (Design_Dashboard.md §7.2 Chart 3)
- `COUNT(paid_at)` — PostgreSQL COUNT(col)은 NULL 제외라 단일 쿼리로 5단계 집계 가능
- 코호트 정의: `created_at`이 기간 내인 주문만

### Phase 5 (트리맵 — 카테고리 매출)
- v1: leaf 카테고리 그대로 (root 매핑 없음)
- `products.category_id` JOIN (카테고리 스냅샷 없음 — §3.2 참고)
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
curl -H "Authorization: Bearer <accessToken>" http://localhost:4000/v1/admin/dashboard/kpi

# order-trend (7일)
curl -H "Authorization: Bearer <AT>" \
  "http://localhost:4000/v1/admin/dashboard/order-trend?startDate=2026-04-21&endDate=2026-04-27"

# security (Phase 3)
curl -H "Authorization: Bearer <AT>" \
  "http://localhost:4000/v1/admin/dashboard/security?startDate=2026-04-21&endDate=2026-04-27"
```

### 6.2 프론트 진입
1. `npx nx serve frontend` → http://localhost:3000
2. ADMIN 계정으로 로그인
3. http://localhost:3000/admin → `/admin/dashboard` 자동 리다이렉트
4. 필터 조작 → URL 쿼리스트링 변경 → 차트 자동 refetch

### 6.3 인증 흐름이 안 풀릴 때 체크리스트
1. `middleware.ts`: 비로그인 → /login 리다이렉트 동작?
2. `AdminGuard.tsx`: /auth/me 응답의 Network tab 확인 — 200 + `roles[].name === 'admin'`?
3. 401 응답 시: axios 인터셉터가 자동 refresh 시도하는지 Network tab 확인
4. 새로고침 후 즉시 로그인으로 이동하면: `localhost:3000`과 `localhost:4000`이 쿠키를 공유하는지 확인 (같은 호스트라 쿠키 공유 — 의도된 동작)

### 6.4 타입 체크
```bash
# 백엔드
cd backend && npx tsc -p tsconfig.app.json --noEmit

# 프론트
cd frontend && npx tsc --noEmit
# 0 exit code면 OK
```

---

## 7. 절대 변경하면 안 되는 것

1. **기존 auth 흐름**: `auth-storage.ts`, `auth-channel.ts`, `axios-http-client.ts`의 인터셉터 로직 — 다른 페이지가 의존
2. **AuditAction enum**: 기존 코드가 의존. 추가는 가능하나 기존 값 변경 금지
3. **Role enum 값**: `'admin'` (소문자)
4. **`(main)/admin/` 폴더**: 이미 삭제됨. 부활 금지
5. **next.config.js의 `rewrites()`**: 일반 API 호출의 핵심 경로
6. **AdminGuard.tsx의 로컬 MeResponse 인터페이스**: shared `UserProfileResponse.roles`는 `string[]`이지만 실제 응답은 `{ name: string }[]` — 수정하면 타입 에러 또는 런타임 체크 실패

---

## 8. 메모리에 저장된 사용자 컨텍스트

- 신입 백엔드 개발자, 포트폴리오용
- 한국어 소통, 과한 추상화 금지
- 라이브러리는 학습 곡선 낮은 것 우선 (차트는 ECharts로 통일)
- 외부 도구 도입 금지 (ELK, Datadog 등)
- "1. 코드 → 2. 설계 이유 → 3. 대안 비교" 순서 준수

---

**END OF HANDOFF**
