# 관리자 대시보드 — 컨텍스트 인수인계 문서 (Phase 1 → Phase 2)

> 작성일: 2026-04-27
> 목적: Phase 0~1 구현이 완료된 시점에서 다음 컨텍스트로 작업을 이어받기 위한 핵심 정보.
> **참고 문서 (반드시 함께 읽을 것)**:
> - `docs/Design_Dashboard.md` — 설계 청사진 (Phase 0~7 전체 계획)
> - `docs/Design_Dashboard_log.md` / `Design_Dashboard_log2.md` — 사전 설계 논의 로그

---

## 0. 빠른 시작 — 다음 컨텍스트에서 첫 발화 예시

```
관리자 대시보드 Phase 2부터 이어서 구현한다. 이전 컨텍스트에서 Phase 0~1 완료.
docs/Design_Dashboard.md (설계 청사진), docs/Design_Dashboard_Handoff.md (인수인계) 참조.

다음 작업: Phase 2-B (GET /v1/admin/dashboard/order-trend) → Phase 2-F (DashboardFilters)
→ Phase 2-C (lib/charts/order-trend.ts + OrderTrendChart 컴포넌트).

Phase 1과 동일하게:
1. 코드 → 2. 설계 이유 → 3. 대안 비교
한 단계씩 끊어서 진행한다.
```

---

## 1. 현재까지 구현된 것 (Phase 0~1)

### 1.1 Phase 0 — 환경 정리

| 파일 | 역할 |
|------|------|
| `frontend/src/middleware.ts` | `/admin/*`에서 refreshToken 쿠키 존재만 체크 |
| `frontend/src/app/(admin)/layout.tsx` | EC2 직접 호출로 ADMIN role 검증 (서버-to-서버) |
| `frontend/src/app/(admin)/admin/components/AdminSidebar.tsx` | 사이드바 (인라인 스타일) — 7개 메뉴 |
| `frontend/src/app/(admin)/admin/page.tsx` | `/admin` → `/admin/dashboard` 리다이렉트 |
| `frontend/src/app/(admin)/admin/{dashboard,audit-logs,categories,orders,products,sellers,settlements}/` | 기존 `(main)/admin/*`에서 이동 |
| `frontend/src/app/api/auth/login/route.ts` | BFF: 로그인 → refreshToken 쿠키 재발급 |
| `frontend/src/app/api/auth/logout/route.ts` | BFF: 로그아웃 → refreshToken 쿠키 삭제 |
| `frontend/src/app/api/auth/refresh/route.ts` | BFF: 토큰 갱신 → 새 refreshToken 재발급 |
| `frontend/src/app/api/auth/_lib/cookie.ts` | Set-Cookie 파싱 헬퍼 |

**주의**: 기존 `frontend/src/app/(main)/admin/` 폴더는 **완전히 삭제됨**.

### 1.2 Phase 1 — KPI

| 파일 | 역할 |
|------|------|
| `backend/src/admin/admin.module.ts` | TypeORM(OrderEntity, AuditLogEntity) + AuthModule |
| `backend/src/admin/dashboard/dashboard.controller.ts` | `@Controller('v1/admin/dashboard')` + ADMIN 가드 |
| `backend/src/admin/dashboard/dashboard.service.ts` | KPI 단일 raw SQL (6개 서브쿼리) |
| `backend/src/admin/dashboard/helpers/time-range.helper.ts` | KST 변환 / delta% / 90일 검증 |
| `backend/src/admin/dashboard/dto/date-range-query.dto.ts` | DateRangeQueryDto, OrderTrendQueryDto |
| `backend/src/admin/dashboard/dto/kpi-response.dto.ts` | KpiResponseDto (Serialize용) |
| `backend/src/app/app.module.ts` | AdminModule 등록 (라인 26, 75) |
| `frontend/src/service/admin-dashboard.ts` | fetchKpi + KpiResponse 타입 |
| `frontend/src/hooks/useDashboardQuery.ts` | useKpiQuery (staleTime 60초) |
| `frontend/src/app/(admin)/admin/dashboard/components/KpiCards.tsx` | 4 카드 (인라인 스타일) |
| `frontend/src/app/(admin)/admin/dashboard/page.tsx` | 헤더 + KpiCards + Phase 2~5 슬롯 코멘트 |

### 1.3 라이브러리 추가
- `frontend/package.json`: `echarts ^5.5.1`, `echarts-for-react ^3.0.2` 설치 완료

---

## 2. 코드베이스에서 발견한 패턴 (반드시 준수)

### 2.1 백엔드 패턴

**컨트롤러 라우팅**: `@Controller('v1/...')` — `main.ts`의 `setGlobalPrefix('v1')`이 적용되어 있지만, 다른 컨트롤러들도 `v1/...`을 명시적으로 적힘. 따라가기.

**Serialize 인터셉터**: `backend/src/common/interceptors/serialize.interceptor.ts`의 `@Serialize(DtoClass)` 데코레이터 사용. ClassSerializerInterceptor가 글로벌이지만 응답 DTO 매핑은 `@Serialize`로 명시.

**ADMIN 가드 패턴** (audit.controller.ts와 동일):
```ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
```

**Role 값**: `Role.ADMIN = 'admin'` (소문자, [user/entity/role.entity.ts](../backend/src/user/entity/role.entity.ts)).

**ValidationPipe**: 글로벌 등록됨 (`transform: true`). DTO에 class-validator 데코레이터만 붙이면 자동 검증.

**raw SQL**: TypeORM `repo.query(sql, params)` — Postgres `$1, $2, ...` placeholder. `numeric` 컬럼은 문자열로 떨어지므로 `Number()` 캐스팅 필수.

### 2.2 프론트엔드 패턴

**axios 클라이언트**: `frontend/src/lib/axios/axios-http-client.ts`
- `publicClient`: 인증 불필요
- `authClient`: Authorization 헤더 자동 + 401 시 자동 refresh
- `baseURL = process.env.NEXT_PUBLIC_API_URL` (로컬 dev: `http://localhost:4000/v1`, Vercel: `/api`)

**서비스 패턴**: `frontend/src/service/<도메인>.ts` — axios 호출 함수만. 응답 타입도 여기에.

**훅 패턴**: `frontend/src/hooks/<use*.ts>` — React Query useQuery/useMutation 래퍼. (혼동 주의: `frontend/src/hook/`(단수)도 별도 존재)

**Next.js App Router**: 15.2.4 / React 19 / `cookies()` async (Next 15 변경점 — `await cookies()`).

### 2.3 Vercel 배포 환경변수 (사용자가 이미 설정함)
- `NEXT_PUBLIC_API_URL=/api` (브라우저 → Vercel)
- `API_PROXY_TARGET=http://[퍼블릭IP]:4000/v1` (Vercel 서버 → EC2; `next.config.js` rewrites + BFF 양쪽에서 사용)

---

## 3. 알려진 제약 / 트레이드오프

### 3.1 (admin)/layout.tsx의 refreshToken 사이드 이펙트
**문제**: 서버 컴포넌트는 cookies().set() 불가 → EC2 `/auth/refresh`가 새 refreshToken을 내려줘도 브라우저 쿠키에 반영 안 됨.
**현재 동작**: 새 refreshToken은 버려짐. 백엔드가 토큰 회전(rotation)을 strict 하게 한다면 매 admin 페이지 진입마다 다음 refresh가 실패할 수 있음.
**검증 필요**: [auth.service.ts](../backend/src/auth/auth.service.ts) refresh 메서드가 old token을 즉시 invalidate 하는지. strict 회전이라면 backend에 "verify-only" 엔드포인트 추가 검토.

### 3.2 카테고리 스냅샷 부재
**현 v1 정책**: `order_items`에 `categoryId` 스냅샷 없음 → Phase 5 트리맵은 `products.category_id`로 JOIN.
**부작용**: 주문 후 상품 카테고리 변경 시 과거 매출이 새 카테고리에 잡힘. 포트폴리오 수준에서 허용.

### 3.3 Phase 1-B에서 auditRepo 의도적 미주입
DashboardService는 `orderRepo.query()`로 audit_logs까지 조회 가능 (같은 connection). Phase 3-B (security)에서 `auditRepo`를 추가 주입할 때 `AdminModule`은 이미 `TypeOrmModule.forFeature([..., AuditLogEntity])`에 등록되어 있음.

### 3.4 Phase 1 KPI 응답에 `generatedAt` 포함
프론트는 아직 미사용. Phase 6의 DataFreshness 컴포넌트에서 활용 예정.

---

## 4. 다음 작업 (Phase 2 — 일별 주문/결제 꺾은선)

### 4.1 Phase 2-B: 백엔드 `GET /v1/admin/dashboard/order-trend`

**쿼리 파라미터**: `startDate`, `endDate` (YYYY-MM-DD), `compareWithPrevious=true|false`
→ `OrderTrendQueryDto` 이미 만들어둠 (`backend/src/admin/dashboard/dto/date-range-query.dto.ts:18`)

**SQL** (Design_Dashboard.md §7.2 Chart 1 참조):
```sql
SELECT
  TO_CHAR((created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul')::date, 'YYYY-MM-DD') AS date,
  SUM(CASE WHEN action = 'ORDER_CREATED'    AND success THEN 1 ELSE 0 END) AS ordered,
  SUM(CASE WHEN action = 'PAYMENT_VERIFIED' AND success THEN 1 ELSE 0 END) AS paid,
  SUM(CASE WHEN action = 'ORDER_CANCELLED'  AND success THEN 1 ELSE 0 END) AS cancelled
FROM audit_logs
WHERE created_at >= $1 AND created_at < $2
  AND action IN ('ORDER_CREATED','PAYMENT_VERIFIED','ORDER_CANCELLED')
GROUP BY 1
ORDER BY 1 ASC
```

**필요 헬퍼**:
- `toKstRange(startDate, endDate)` — 이미 `time-range.helper.ts`에 있음 ✓
- `validateDateRange()` — 이미 있음 ✓
- `fillEmptyDates()` — **새로 작성 필요** (Design_Dashboard.md §7.4)
- `compareWithPrevious=true`일 때 동일 길이의 직전 기간 한 번 더 쿼리

**응답 DTO**: `OrderTrendResponseDto` 신규 작성
```ts
interface OrderTrendResponse {
  current: Array<{ date: string; ordered: number; paid: number; cancelled: number }>;
  previous?: Array<...>;
  generatedAt: string;
}
```

**서비스 메서드**: `dashboardService.getOrderTrend(query)` 신규
**컨트롤러 메서드**: `dashboardController.getOrderTrend(@Query() query: OrderTrendQueryDto)`

### 4.2 Phase 2-F: 프론트 `DashboardFilters.tsx`

**상태 진실 원천 = URL 쿼리 파라미터** (Design_Dashboard.md §8.1)
- `?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&compare=true`

**컴포넌트 책임**:
- 7d / 30d 빠른 선택 버튼
- 커스텀 date picker (HTML `<input type="date">` 사용)
- "전기 대비 비교" 토글
- `router.push({ query })` → 모든 차트가 `useSearchParams()`로 변경 감지

**위치**: `frontend/src/app/(admin)/admin/dashboard/components/DashboardFilters.tsx`

**page.tsx 수정**: 헤더 영역에 `<DashboardFilters />` 추가 (KpiCards 위)

### 4.3 Phase 2-C: 차트

**옵션 빌더**: `frontend/src/lib/charts/order-trend.ts`
- 순수 함수 `buildOrderTrendOption(data: OrderTrendResponse): EChartsOption`
- 단위 테스트 가능 (테스트는 시간 부족 시 생략)

**컴포넌트**: `frontend/src/app/(admin)/admin/dashboard/components/OrderTrendChart.tsx`
- `'use client'`
- `import ReactECharts from 'echarts-for-react'`
- `useSearchParams()`로 startDate/endDate/compare 읽기
- `useOrderTrendQuery(params)` — `useDashboardQuery.ts`에 추가
- 시리즈: 3 실선 (주문/결제완료/취소) + (compare=true일 때) 2 점선 (주문 전기/결제완료 전기)

**훅 추가**: `frontend/src/hooks/useDashboardQuery.ts`에 `useOrderTrendQuery({ startDate, endDate, compare })` 추가
- queryKey: `['dashboard', 'order-trend', startDate, endDate, compare]`
- staleTime: 5분

**서비스 추가**: `frontend/src/service/admin-dashboard.ts`에 `fetchOrderTrend()` + `OrderTrendResponse` 타입 추가

### 4.4 작업 순서
1. **2-B 먼저** (백엔드 완성 후 Postman/curl로 응답 형태 확인)
2. **2-F (필터)** — KPI 옆에 추가, URL 변경 동작 확인
3. **2-C** — 차트 그리기. 차트 라이브러리는 ECharts (이미 설치됨)

---

## 5. Phase 3~7 구현 시 참고 사항

### Phase 3 (보안 차트 — 이중 Y축)
- audit_logs LOGIN/FAILED_LOGIN/ACCOUNT_LOCKED 일별 집계
- 이중 Y축: 좌측 막대(건수), 우측 선(실패율%)
- `markLine` 10% 임계선, 초과 일자는 `itemStyle.color` 함수로 색 변경

### Phase 4 (펀넬 — 코호트)
- orders 단일 쿼리 (Design_Dashboard.md §7.2 Chart 3)
- `COUNT(paid_at)`, `COUNT(shipped_at)` 등 NULL 제외 카운트 트릭 사용
- 코호트 정의: `created_at`이 기간 내인 주문에 한해 5단계 도달률

### Phase 5 (트리맵 — 카테고리 매출)
- v1: leaf 카테고리 그대로 (root 매핑 없음)
- 카테고리 스냅샷 없음 → `products.category_id` JOIN
- 색상 매핑: deltaPercent → 진초/연초/노랑/빨강 4 구간

### Phase 6 (확장 UX)
- DataFreshness — `KpiResponse.generatedAt` + 5초 폴링 훅
- 차트 클릭 드릴다운 — ECharts `onClick` → `router.push('/admin/audit-logs?...')`
- CSV — 별도 `.csv` 엔드포인트 (Content-Type: text/csv)

### Phase 7 (성능)
- orders 인덱스 3개 추가 (Design_Dashboard.md §10.1)
- Redis 캐싱 — 차트별 TTL 차등 (Design_Dashboard.md §10.2)
- **신입 수준 디버깅 가능성 우선**: `CacheInterceptor` 데코레이터보다 `redis.get/set` 명시 호출 권장

---

## 6. 동작 확인 / 디버깅 팁

### 6.1 백엔드 단독 테스트
```bash
# 서버 시작
npx nx serve backend

# KPI 호출 (ADMIN 토큰 필요)
curl -H "Authorization: Bearer <accessToken>" http://localhost:4000/v1/admin/dashboard/kpi
```

### 6.2 프론트 진입
1. `npx nx serve frontend` → http://localhost:3000
2. ADMIN 계정으로 로그인
3. 자동 리다이렉트 또는 직접 이동: http://localhost:3000/admin
4. → `/admin/dashboard`로 자동 redirect → KPI 4 카드 표시

### 6.3 인증 흐름이 안 풀릴 때 체크리스트
1. middleware: 비로그인 → /login 리다이렉트 동작?
2. (admin)/layout: refreshToken 쿠키 유효 + ADMIN role?
3. KpiCards: 401 응답 시 axios 인터셉터가 자동 refresh 시도하는지 (network tab)
4. CORS: 백엔드 [main.ts](../backend/src/main.ts) FRONTEND_URL 일치?

### 6.4 타입 체크
```bash
# 백엔드
cd backend && npx tsc -p tsconfig.app.json --noEmit
# (기존 코드의 unrelated 에러는 무시. admin/* 경로 에러만 봄)

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

---

## 8. 메모리에 저장된 사용자 컨텍스트

- 신입 백엔드 개발자, 포트폴리오용
- 한국어 소통, 과한 추상화 금지
- 라이브러리는 학습 곡선 낮은 것 우선 (단, 차트는 ECharts로 통일 결정)
- 외부 도구 도입 금지 (ELK, Datadog 등)

---

**END OF HANDOFF**
