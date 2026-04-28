# 관리자 대시보드 설계 문서 (구현 청사진)

> 본 문서는 `Design_Dashboard_log.md`, `Design_Dashboard_log2.md`의 사전 설계 논의를 바탕으로
> 실제 구현 단계에서 참조할 청사진이다. 한 번 결정된 사항은 흔들지 않는다.

작성일: 2026-04-27
대상: 신입 백엔드 개발자 / 포트폴리오용

---

## 목차

1. [전체 개요](#1-전체-개요)
2. [기술 스택 & 라이브러리 결정](#2-기술-스택--라이브러리-결정)
3. [폴더 구조](#3-폴더-구조)
4. [인증/인가 3중 방어](#4-인증인가-3중-방어)
5. [BFF 패턴 — Vercel + EC2 환경](#5-bff-패턴--vercel--ec2-환경)
6. [백엔드 API 설계](#6-백엔드-api-설계)
7. [DB 쿼리 설계](#7-db-쿼리-설계)
8. [프론트 데이터 흐름](#8-프론트-데이터-흐름)
9. [차트별 상세 설계 (KPI + 4 charts)](#9-차트별-상세-설계)
10. [성능 / 캐싱 / 인덱스](#10-성능--캐싱--인덱스)
11. [구현 순서 (단계별 체크리스트)](#11-구현-순서)
12. [알려진 한계 & 향후 개선](#12-알려진-한계--향후-개선)

---

## 1. 전체 개요

### 1.1 목적
멀티 셀러 오픈마켓 운영자가 한 페이지에서 다음을 파악할 수 있어야 한다.

- **오늘 무슨 일이 일어났는가** — KPI 카드
- **추세는 어떤 방향인가** — 일별 주문/결제 꺾은선
- **결제 전환은 건강한가** — 펀넬
- **어느 카테고리가 잘 팔리는가** — 트리맵
- **보안 이상 신호는 없는가** — 로그인 보안 차트

### 1.2 화면 레이아웃

```
URL: /admin/dashboard?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD

┌──────────────────────────────────────────────────────────┐
│ 사이드바 │  [헤더: 기간 필터 / 마지막 갱신 시각]            │
│ (콘솔)  ├──────────────────────────────────────────────┤
│         │  KPI 카드 4개 (가로)                            │
│         ├──────────────────────────────────────────────┤
│         │  일별 주문/결제 (꺾은선) — 전체 너비             │
│         ├────────────────────────┬─────────────────────┤
│         │  결제 전환 펀넬          │  카테고리별 매출 트리맵 │
│         ├──────────────────────────────────────────────┤
│         │  로그인 보안 (막대 + 선)                        │
└──────────────────────────────────────────────────────────┘
```

### 1.3 핵심 결정 요약 (한 줄씩)

| 영역 | 결정 |
|------|------|
| 라우팅 | `(admin)/admin/*` route group 분리 |
| 인증 | middleware → server layout → backend RolesGuard 3중 |
| 토큰 저장 | accessToken은 localStorage(현행 유지), refreshToken은 httpOnly 쿠키 |
| 배포 환경 대응 | BFF 패턴 (`/api/auth/login|logout|refresh` Next API Route 신규) |
| 차트 라이브러리 | ECharts (Funnel/Treemap 모두 지원) |
| 데이터 fetch | React Query, queryKey는 URL 쿼리 파라미터 기반 |
| 상태 진실 원천 | URL 쿼리 파라미터 (`startDate`, `endDate`) |
| DB 쿼리 | TypeORM QueryBuilder + `.getRawMany()`, `AT TIME ZONE 'Asia/Seoul'` 명시 |
| 모듈 구조 | 백엔드 `admin/dashboard/` 신규, audit/orders 양쪽 도메인 의존 |
| 캐싱 | Redis TTL 차등 (kpi 60초 / trend 5분 / funnel 10분 / revenue 30분) |
| 기간 제한 | DTO에서 startDate ≤ endDate, 최대 90일 검증 |

---

## 2. 기술 스택 & 라이브러리 결정

### 2.1 백엔드 (이미 갖춰진 것)
- NestJS 11 / TypeScript / TypeORM / PostgreSQL / Redis / JWT
- `AuditModule` (audit_logs 테이블, AuditAction enum, @Auditable)
- `JwtAuthGuard`, `RolesGuard`, `@Roles(Role.ADMIN)` 데코레이터
- `Role.ADMIN = 'admin'` (소문자, [role.entity.ts:7](backend/src/user/entity/role.entity.ts#L7))

### 2.2 프론트엔드 (이미 갖춰진 것)
- Next.js 15 App Router / React 19 / React Query 5 / axios
- `ReactQueryProvider` 설정 완료
- `auth-storage.ts`, `auth-channel.ts` (BroadcastChannel 탭 동기화)

### 2.3 신규 설치 필요
```bash
# 프론트엔드 (frontend/package.json)
echarts                # 차트 코어
echarts-for-react      # React 래퍼
date-fns               # 기간 계산 (이미 있으면 생략)
```

`recharts`, `chart.js` 등은 사용하지 않음. **ECharts로 통일** (Funnel/Treemap을 모두 지원하는 유일한 후보).

---

## 3. 폴더 구조

### 3.1 프론트엔드

```
frontend/src/app/
├── (auth)/                       (기존)
├── (main)/                       (기존, 일반 사용자 페이지)
│   └── admin/                    ❌ 삭제 (이동)
├── (admin)/                      ✅ 신규
│   ├── layout.tsx                ── 셸만 렌더 (서버 검증 없음 — §4 참고)
│   └── admin/
│       ├── components/
│       │   ├── AdminGuard.tsx              ── Client (/auth/me + roles 검증)
│       │   └── AdminSidebar.tsx            ── 사이드바 (인라인 스타일)
│       ├── dashboard/            ✅ 이번 구현 핵심
│       │   ├── page.tsx          (Server Component, Suspense 경계)
│       │   └── components/
│       │       ├── DashboardFilters.tsx     ── Client (URL 쿼리 조작)
│       │       ├── KpiCards.tsx             ── Client (/kpi)
│       │       ├── OrderTrendChart.tsx      ── Client (/order-trend)
│       │       ├── SecurityChart.tsx        ── Client (/security)
│       │       ├── FunnelChart.tsx          ── Client (/funnel)
│       │       ├── CategoryRevenueChart.tsx ── Client (/category-revenue)
│       │       └── DataFreshness.tsx        ── Client (마지막 갱신 시각)
│       ├── audit-logs/           (이동)
│       ├── categories/           (이동)
│       ├── orders/               (이동)
│       ├── products/             (이동)
│       ├── sellers/              (이동)
│       └── settlements/          (이동)
├── api/
│   └── auth/                     ✅ BFF 신규
│       ├── _lib/cookie.ts        ── Set-Cookie 파싱 헬퍼
│       ├── login/route.ts
│       ├── logout/route.ts
│       └── refresh/route.ts
├── layout.tsx                    (기존)
└── ...

frontend/src/lib/
└── charts/                       ✅ 신규 — ECharts 옵션 빌더 (순수 함수)
    ├── order-trend.ts            buildOrderTrendOption(data)
    ├── security.ts               buildSecurityOption(data)
    ├── funnel.ts                 buildFunnelOption(data)
    └── category-revenue.ts       buildCategoryRevenueOption(data)

frontend/src/hooks/                ✅ 신규
├── useDateRange.ts                ── URL 쿼리 ↔ Date 변환
└── useDashboardQuery.ts           ── React Query 공통 옵션

frontend/src/middleware.ts         ✅ 신규 — refreshToken 쿠키 존재 체크
```

**왜 route group을 분리하는가?**
`(admin)`은 URL에 영향 없는 폴더 그룹. 같은 `/admin/*` URL이지만 레이아웃이 완전히 다름 (사이드바 콘솔 vs 쇼핑몰 헤더/푸터). 기존 `(main)/admin/` 폴더는 **완전히 삭제됨** (Phase 0).

> ⚠️ **§4와의 차이 (Phase 2에서 수정)**: 본 절은 원래 `(admin)/layout.tsx`를 Server Component로 두고 ADMIN role을 검증하도록 설계했으나, Server Component가 `cookies().set()`을 못해 **token rotation DoS**가 발생함. 현재는 `layout.tsx`는 셸만 렌더하고 검증은 `AdminGuard.tsx` (Client Component)에서 수행. 자세한 사유는 §4 참고.

### 3.2 백엔드

```
backend/src/admin/                ✅ 신규
├── admin.module.ts
└── dashboard/
    ├── dashboard.controller.ts
    ├── dashboard.service.ts
    └── dto/
        ├── date-range-query.dto.ts        ── @IsISO8601, max 90일
        ├── kpi-response.dto.ts
        ├── order-trend-response.dto.ts
        ├── security-response.dto.ts
        ├── funnel-response.dto.ts
        └── category-revenue-response.dto.ts
```

**왜 별도 `admin` 모듈인가?**
대시보드 서비스는 `AuditLogEntity` + `OrderEntity` + `OrderItemEntity` + `CategoryEntity` + `ProductEntity` 다섯을 모두 read-only로 참조한다. `audit` 모듈에 넣으면 orders 의존성이 역류, `order` 모듈에 넣으면 audit 의존성이 역류한다. 별도 `admin/dashboard/`는 이 양방향 의존을 깔끔히 끊는다.

`AdminModule`은 `TypeOrmModule.forFeature([AuditLogEntity, OrderEntity, OrderItemEntity, ProductEntity, CategoryEntity])`로 엔티티만 import하면 충분 (서비스는 호출하지 않음).

---

## 4. 인증/인가 3중 방어

### 4.1 왜 3중인가?

| 레이어 | 역할 | 우회 가능? |
|--------|------|-----------|
| 1. middleware.ts (Edge Runtime) | refreshToken 쿠키 존재 체크 → 없으면 `/login` 리다이렉트 | ✅ (쿠키 위조하면 통과) |
| 2. AdminGuard.tsx (Client Component) | `/v1/auth/me` 호출 → `roles[].name === 'admin'` 검증 → 아니면 redirect | ✅ (브라우저에서 우회 가능, 미들웨어 우회 후 직접 호출 가능) |
| 3. Backend `@Roles(Role.ADMIN)` 가드 | JWT 검증 + roles 검증 | ❌ **진실의 원천** |

1·2는 UX (잘못 들어온 사용자를 빠르게 돌려보내기), **3이 실제 보안**. 1·2가 뚫려도 데이터는 보호된다.

> ⚠️ **Phase 2에서 변경된 사항 — 반드시 읽을 것**:
> 본래 설계는 layout.tsx (Server Component)에서 `/v1/auth/me`를 호출하는 구조였다. 하지만 Server Component는 `cookies().set()`이 불가능해, 백엔드가 회전한 새 refreshToken을 브라우저 쿠키에 반영할 수 없다. 다음 요청은 무효화된 이전 토큰 사용 → reuse detection 발동 → `revokeAllUserTokens` → 모든 세션 invalidate → 401 → 로그인 루프. **결론: Server Component에서 token rotation 엔드포인트를 절대 호출하지 말 것.** 검증은 Client Component(`AdminGuard.tsx`)에서만 수행. axios 인터셉터가 Set-Cookie를 브라우저가 자동 처리하도록 위임.

### 4.2 왜 미들웨어에서 role을 못 보는가?

- accessToken은 [auth-storage.ts](frontend/src/service/auth-storage.ts)를 통해 localStorage에 저장됨
- Edge Runtime은 `localStorage`/`window` 접근 불가
- 미들웨어가 읽을 수 있는 것은 쿠키/헤더/URL뿐
- refreshToken은 httpOnly 쿠키이지만 payload에 roles가 없음 (또 Edge에서 `jose`로 검증해도 노출되는 정보는 같음)

→ **roles 검증은 `AdminGuard.tsx` (Client Component)에서 `/v1/auth/me`를 호출하여 처리**한다. axios의 401 인터셉터가 BFF refresh를 호출하면 브라우저가 Set-Cookie를 자동 처리한다.

> 📝 **타입 주의 (Phase 2 발견)**: `AdminGuard.tsx`는 `MeResponse` 인터페이스를 **로컬 정의**한다. shared 타입 `UserProfileResponse.roles`는 `string[]`이지만 실제 응답은 `{ name: string }[]` (class-transformer 출력 차이). 공유 타입 임포트 시 런타임 체크 실패.

### 4.3 구현 코드 청사진

#### `frontend/src/middleware.ts`
```ts
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith('/admin')) return NextResponse.next();

  const refreshToken = req.cookies.get('refreshToken')?.value;
  if (!refreshToken) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*'] };
```

#### `frontend/src/app/(admin)/layout.tsx` (셸만)
```tsx
// Server Component이지만 인증 검증 로직 없음 — AdminGuard로 위임
import { AdminGuard } from './admin/components/AdminGuard';
import { AdminSidebar } from './admin/components/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="admin-shell">
        <AdminSidebar />
        <main>{children}</main>
      </div>
    </AdminGuard>
  );
}
```

#### `frontend/src/app/(admin)/admin/components/AdminGuard.tsx` (Client)
```tsx
'use client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authClient } from '@/service/axios-http-client';

interface MeResponse {  // 로컬 정의 — shared 타입과 형태 다름
  id: string;
  email: string;
  roles: { name: string }[];
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data, isLoading, error } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => (await authClient.get<MeResponse>('/auth/me')).data,
    retry: false,
  });

  if (isLoading) return <div>인증 확인 중...</div>;

  const isAdmin = data?.roles?.some((r) => r.name === 'admin');
  if (error || !isAdmin) {
    router.replace('/login?redirect=/admin/dashboard');
    return null;
  }

  return <>{children}</>;
}
```

> 💡 **왜 BFF `/api/auth/me`를 만들지 않았는가?** (원래 설계 변경)
> 본 문서 초기 설계에서는 BFF `/api/auth/me`를 만들어 Server Component가 호출하는 구조였다. 그러나 Phase 2에서 발견된 token rotation DoS 문제 때문에 검증 자체를 Client Component로 옮겼다. axios 인터셉터가 401 발생 시 BFF `/api/auth/refresh`를 호출하면 브라우저가 Set-Cookie를 자동 처리하므로, 별도의 BFF `/me` 라우트가 불필요해졌다.

---

## 5. BFF 패턴 — Vercel + EC2 환경

### 5.1 왜 필요한가?
현재 [next.config.js](frontend/next.config.js)의 `rewrites()`로 `/api/*` → EC2 프록시. 이 방식은:
- ✅ 일반 API 호출은 잘 동작 (요청/응답 본문 통과)
- ❌ EC2가 보낸 `Set-Cookie` 헤더가 Vercel Edge를 통과할 때 **도메인 변환·SameSite 처리·Secure 플래그**가 환경에 따라 누락될 수 있음
- ❌ 결과적으로 refreshToken이 브라우저에 저장 안 되거나, 다음 요청에 미동봉

→ **인증 관련 3개 엔드포인트만 BFF로 처리**하여 Vercel 도메인 기준으로 쿠키를 직접 Set-Cookie 한다.

### 5.2 핵심 인사이트
**Next.js API Route(`src/app/api/auth/login/route.ts`)는 `rewrites()`보다 우선** 순위가 높음. 즉, `axios.post('/api/auth/login')`을 호출하면 rewrite를 타지 않고 우리가 만든 API Route로 들어온다. axios `baseURL = '/api'` 그대로 유지 가능.

### 5.3 신규 파일 (실제 구현: 3개 + 헬퍼 1개)

> **원래 설계는 4개**(login/logout/refresh/me)였으나, §4에서 설명한 token rotation 이슈로 `/me`는 BFF가 아닌 Client Component(`AdminGuard.tsx`)에서 직접 백엔드 `/v1/auth/me`를 호출하도록 변경되었다. 따라서 실제 BFF 라우트는 3개 + 공통 헬퍼 1개.

#### `frontend/src/app/api/auth/login/route.ts`
```ts
import { NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_INTERNAL_URL!;  // 서버에서만 접근

export async function POST(req: Request) {
  const body = await req.json();
  const upstream = await fetch(`${BACKEND}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await upstream.json();

  if (!upstream.ok) return NextResponse.json(data, { status: upstream.status });

  // EC2가 내려준 refreshToken 쿠키 추출
  const setCookie = upstream.headers.get('set-cookie');
  const refreshToken = parseRefreshTokenFromSetCookie(setCookie);

  const res = NextResponse.json({ accessToken: data.accessToken, user: data.user });
  if (refreshToken) {
    res.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: body.persistent ? 7 * 24 * 60 * 60 : undefined,
    });
  }
  return res;
}
```

#### `frontend/src/app/api/auth/refresh/route.ts`
- 쿠키에서 refreshToken 읽어 EC2에 `Cookie: refreshToken=...` 전달
- 응답에서 새 accessToken 추출하여 body 반환, 새 refreshToken 다시 Set-Cookie

#### `frontend/src/app/api/auth/logout/route.ts`
- EC2에 logout 호출 후 `refreshToken` 쿠키를 maxAge=0으로 삭제

#### `frontend/src/app/api/auth/_lib/cookie.ts`
- 백엔드의 Set-Cookie 헤더에서 refreshToken 값과 만료 정보를 파싱하는 공용 헬퍼

> ❌ **`/api/auth/me/route.ts`는 만들지 않음** (원래 설계 변경): §4에서 설명한 token rotation 문제로 검증을 Client Component로 옮긴 결과, 이 라우트는 불필요. `AdminGuard.tsx`가 `authClient.get('/auth/me')`로 백엔드를 직접 호출한다.

### 5.4 다른 API 호출은?
대시보드 데이터 fetch (`GET /v1/admin/dashboard/*`)는 **rewrites() 그대로 사용**. 이 요청들은 쿠키가 아닌 `Authorization: Bearer <accessToken>` 헤더로 인증 → Set-Cookie 포워딩 이슈 없음.

### 5.5 향후 Nginx + HTTPS 전환 시
- **같은 루트 도메인** (예: `www.X.com` + `api.X.com`): BFF 제거 가능 (직접 호출). 하지만 유지해도 무관.
- **별도 도메인**: BFF 유지가 SameSite=None+CSRF 방어보다 단순.

---

## 6. 백엔드 API 설계

### 6.1 엔드포인트 (모두 `JwtAuthGuard + RolesGuard, @Roles(Role.ADMIN)`)

```
GET /v1/admin/dashboard/kpi
GET /v1/admin/dashboard/order-trend?startDate=&endDate=&compareWithPrevious=true
GET /v1/admin/dashboard/security?startDate=&endDate=
GET /v1/admin/dashboard/funnel?startDate=&endDate=
GET /v1/admin/dashboard/category-revenue?startDate=&endDate=
```

> ⚠️ **컨트롤러 선언 시 `v1/` 접두사 절대 금지**: NestJS `main.ts`에서 `setGlobalPrefix('v1')`이 자동 prefix를 붙이므로, 컨트롤러는 `@Controller('admin/dashboard')`로 선언해야 한다. `@Controller('v1/admin/dashboard')`로 쓰면 최종 URL이 `/v1/v1/admin/dashboard`가 된다. 위의 URL은 **최종 URL**이지 컨트롤러 선언이 아니다.

CSV 확장 (이번 단계 마지막에):
```
GET /v1/admin/dashboard/order-trend.csv?startDate=&endDate=
GET /v1/admin/dashboard/category-revenue.csv?startDate=&endDate=
```

### 6.2 왜 4개를 분리하나? (한 엔드포인트로 묶지 않는 이유)

1. **캐싱 TTL이 다름** — kpi 60초, revenue 30분
2. **부분 실패 격리** — 펀넬이 느려도 KPI는 보임
3. **React Query queryKey 독립** — 차트 한 개만 refetch 가능
4. **DTO 단순화** — 각 응답이 독립적이라 타입 명료

### 6.3 공통 DTO

#### `dto/date-range-query.dto.ts`
```ts
import { IsISO8601, IsOptional, IsBooleanString } from 'class-validator';

export class DateRangeQueryDto {
  @IsISO8601()
  startDate: string;   // 'YYYY-MM-DD'

  @IsISO8601()
  endDate: string;     // 'YYYY-MM-DD'

  @IsOptional()
  @IsBooleanString()
  compareWithPrevious?: string;  // 'true' | 'false'
}
```

추가 검증 (서비스 레이어):
- `startDate ≤ endDate`
- `endDate - startDate ≤ 90일`
- 둘 다 KST 기준으로 해석

### 6.4 응답 DTO 골격 — 자세한 구조는 §9 차트 절 참고

```ts
interface KpiResponse {
  todayOrders:        { value: number; deltaPercent: number };
  todayRevenue:       { value: number; deltaPercent: number };
  pendingShipments:   { value: number };
  loginFailureRate:   { value: number; threshold: 10 };
  generatedAt: string;
}

interface OrderTrendResponse {
  current: Array<{ date: string; ordered: number; paid: number; cancelled: number }>;
  previous?: Array<{ date: string; ordered: number; paid: number; cancelled: number }>;
  generatedAt: string;
}

interface SecurityResponse {
  daily: Array<{ date: string; failed: number; locked: number; total: number; failureRate: number }>;
  generatedAt: string;
}

interface FunnelResponse {
  period: { start: string; end: string };
  stages: Array<{
    name: string;
    count: number;
    rate: number;       // 1단계 대비 %
    dropRate: number;   // 직전 단계 대비 이탈 %
  }>;
  cancelledCount: number;
  generatedAt: string;
}

interface CategoryRevenueResponse {
  current: Array<{ categoryId: number; name: string; revenue: number }>;
  previous?: Array<{ categoryId: number; name: string; revenue: number }>;
  diff: Array<{ categoryId: number; name: string; revenue: number; deltaPercent: number }>;
  generatedAt: string;
}
```

`generatedAt`은 모든 응답에 포함 → 프론트는 React Query `dataUpdatedAt` 보다 이걸 우선 표시 (서버 캐시 만료 시점이 진실).

---

## 7. DB 쿼리 설계

### 7.1 원칙
- **`find()` 금지**, raw SQL + `repo.query()` 사용 (집계는 ORM 매핑이 무용지물). 실제 구현에서는 QueryBuilder보다 raw SQL이 가독성·디버깅 면에서 우수해 raw SQL로 통일.
- **`AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul'`** 이중 캐스트로 모든 일별 GROUP BY에 명시 — UTC로 GROUP BY하면 한국 자정과 9시간 어긋남
- **camelCase 컬럼명은 쌍따옴표 필수** — 엔티티가 `createdAt`이면 SQL은 `"createdAt"`. 따옴표 없이 쓰면 PostgreSQL이 소문자화 → `createdat` 컬럼을 찾아 에러
- **`numeric`/`SUM`/`COUNT` 결과는 string으로 옴** — 서비스에서 `Number()` 캐스팅 필수. SQL에서 `::text` 명시하면 driver 차이를 흡수
- **빈 날짜 채우기** — SQL은 데이터 있는 날짜만 반환 → `fillEmptyDates()` 헬퍼로 0 채우기
- **`startDate`, `endDate`는 KST 자정 기준 [start 00:00, end+1 00:00) 반열림 구간**

### 7.2 차트별 핵심 쿼리

#### Chart 1 — 일별 주문/결제 (audit_logs)
```sql
SELECT
  TO_CHAR(("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul')::date, 'YYYY-MM-DD') AS date,
  SUM(CASE WHEN action = 'ORDER_CREATED'    AND success THEN 1 ELSE 0 END)::text AS ordered,
  SUM(CASE WHEN action = 'PAYMENT_VERIFIED' AND success THEN 1 ELSE 0 END)::text AS paid,
  SUM(CASE WHEN action = 'ORDER_CANCELLED'  AND success THEN 1 ELSE 0 END)::text AS cancelled
FROM audit_logs
WHERE "createdAt" >= $1 AND "createdAt" < $2
  AND action IN ('ORDER_CREATED','PAYMENT_VERIFIED','ORDER_CANCELLED')
GROUP BY 1
ORDER BY 1 ASC;
```
파라미터: `$1` = startDate 00:00 KST → UTC 변환, `$2` = endDate 다음날 00:00 KST → UTC 변환.

`compareWithPrevious=true`면 동일 길이의 직전 기간을 한 번 더 쿼리.

#### Chart 2 — 보안 (audit_logs)
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
ORDER BY 1 ASC;
```

**서비스 레이어에서 파생 계산** (SQL이 아닌 이유: 결손 날짜 + 분모 0 처리를 단일 지점에서):
- `total = success + failed` (locked는 시도가 아닌 결과라 분모 미포함)
- `failureRate = total > 0 ? Math.round((failed / total) * 1000) / 10 : 0` (소수 1자리, 분모 0이면 0)
- `success`는 `total` 계산용 중간값이라 응답 DTO에 미노출.

**처리 순서**: SQL → `Number()` 캐스팅 → `fillEmptyDates({success:0, failed:0, locked:0})` → `total`/`failureRate` 계산 → `SecurityPointDto[]` 빌드. 순서를 어기면 (예: fillEmptyDates 전에 failureRate 계산) 결손 날짜에서 NaN 발생.

#### Chart 3 — 펀넬 (orders, 코호트)
**핵심 트릭**: PostgreSQL `COUNT(column)`은 NULL 제외 카운트. orders 한 번 쿼리로 5단계 집계 가능.

```sql
SELECT
  COUNT(*)                                   AS created,
  COUNT(CASE WHEN status NOT IN ('cancelled','pending_payment') THEN 1 END) AS paid_or_after,
  COUNT(paid_at)                             AS paid,
  COUNT(shipped_at)                          AS shipped,
  COUNT(delivered_at)                        AS delivered,
  COUNT(completed_at)                        AS completed,
  SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled
FROM orders
WHERE created_at >= $1 AND created_at < $2;
```

> **코호트 정의**: `created_at`이 기간 안에 든 주문에 한해 5단계의 도달률을 본다. 예) 4월 1일 생성된 주문이 4월 5일 결제되어도 모두 4월 1일자 코호트로 잡힘. 이게 "결제 전환률"의 정확한 의미.

#### Chart 4 — 카테고리별 매출 (orders + order_items + products + categories)
**한계**: `order_items`에 카테고리 스냅샷이 없어 현재 `products.category_id`로 JOIN. 주문 후 카테고리 변경 시 과거 매출이 새 카테고리로 잡힘.

```sql
SELECT
  root.id   AS category_id,
  root.name AS category_name,
  SUM(oi.subtotal) AS revenue
FROM order_items oi
JOIN orders    o    ON o.id = oi.order_id AND o.paid_at IS NOT NULL
JOIN products  p    ON p.id = oi.product_id
JOIN categories cat ON cat.id = p.category_id
JOIN categories root ON
  CASE
    WHEN cat.depth = 0 THEN root.id = cat.id
    ELSE root.id = (SELECT id FROM categories
                    WHERE position(cat.path IN path) = 1 AND depth = 0
                    LIMIT 1)
  END
WHERE o.paid_at >= $1 AND o.paid_at < $2
GROUP BY root.id, root.name
ORDER BY revenue DESC;
```

> 위 root 매핑은 `category.path`에 ltree-like 문자열이 들어있다고 가정. 실제 path 컬럼 값을 확인한 뒤 `split_part(path, '/', 2)` 같은 단순화로 바꿀 수 있다.
>
> **현실적 단순화 v1**: 일단 **leaf 카테고리 그대로** 집계하여 트리맵을 그린 뒤, 필요시 ROLLUP으로 부모 합계를 계산. 6개 루트로 강제 매핑은 v2 작업으로 미룸.

`paid_at IS NOT NULL` 조건으로 결제 완료된 주문만 집계 (취소 포함하지 않음).

#### KPI — 4개 카드
오늘(KST 기준 자정~현재) 단일 쿼리 4개 또는 1개로 묶기:
```sql
-- 오늘 주문 수, 오늘 매출, 미처리 배송, 로그인 실패율
SELECT
  (SELECT COUNT(*) FROM orders
   WHERE created_at >= today_start AND created_at < tomorrow_start) AS today_orders,
  (SELECT COALESCE(SUM(total_amount),0) FROM orders
   WHERE paid_at >= today_start AND paid_at < tomorrow_start) AS today_revenue,
  (SELECT COUNT(*) FROM orders WHERE status = 'paid') AS pending_shipments,
  (SELECT
     ROUND(SUM(CASE WHEN action='FAILED_LOGIN' THEN 1 ELSE 0 END)::numeric
           / NULLIF(SUM(CASE WHEN action IN ('LOGIN','FAILED_LOGIN') THEN 1 ELSE 0 END),0)
           * 100, 1)
   FROM audit_logs
   WHERE created_at >= today_start AND created_at < tomorrow_start) AS login_failure_rate;
```
`deltaPercent`는 어제 값과 비교하여 서비스 레이어에서 계산.

### 7.3 KST 변환 헬퍼
서비스 안에서 startDate/endDate (YYYY-MM-DD 문자열)를 KST 기준 UTC 타임스탬프 두 개로 변환:

```ts
function toKstRange(startDate: string, endDate: string): [Date, Date] {
  const start = new Date(`${startDate}T00:00:00+09:00`);
  const endNext = new Date(`${endDate}T00:00:00+09:00`);
  endNext.setDate(endNext.getDate() + 1);  // 반열림 구간 [start, end+1)
  return [start, endNext];
}
```

### 7.4 빈 날짜 채우기
```ts
function fillEmptyDates<T extends { date: string }>(
  rows: T[], startDate: string, endDate: string, defaults: Omit<T, 'date'>
): T[] {
  const map = new Map(rows.map(r => [r.date, r]));
  const out: T[] = [];
  const cursor = new Date(`${startDate}T00:00:00+09:00`);
  const last = new Date(`${endDate}T00:00:00+09:00`);
  while (cursor <= last) {
    const key = cursor.toISOString().slice(0, 10);
    out.push(map.get(key) ?? ({ date: key, ...defaults } as T));
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}
```

---

## 8. 프론트 데이터 흐름

### 8.1 상태 진실 원천 = URL 쿼리 파라미터

```
/admin/dashboard?startDate=2026-04-01&endDate=2026-04-27&compare=true
```

장점:
- 새로고침 후에도 같은 화면
- URL 공유로 동일 화면 재현
- 브라우저 뒤로 가기 동작
- React Query queryKey가 URL과 1:1 매핑 → 자연스럽게 캐싱

### 8.2 흐름

```
사용자가 기간 변경 (DashboardFilters)
    ↓ router.push({ query: { startDate, endDate } })
URL 변경
    ↓ useSearchParams() → 모든 차트가 새 값 인식
React Query queryKey = ['dashboard', 'kpi', startDate, endDate] 변경
    ↓ 자동 refetch
새 응답 도착 → 차트 재렌더 (ECharts notMerge=true)
```

### 8.3 컴포넌트별 책임

| 컴포넌트 | 종류 | 책임 |
|---------|------|------|
| `page.tsx` | Server | 레이아웃 셸만 그리고 클라이언트 컴포넌트들 마운트 |
| `DashboardFilters.tsx` | Client | URL 쿼리 조작 (Quick: 7d/30d, custom date picker) |
| `DataFreshness.tsx` | Client | "마지막 갱신: 3분 전" — `dataUpdatedAt`를 5초마다 갱신 |
| `KpiCards.tsx` | Client | 4개 카드, 각 카드는 value + delta% 표시 |
| `OrderTrendChart.tsx` 외 | Client | useQuery → buildXxxOption → ReactECharts |

### 8.4 React Query 공통 옵션

```ts
// hooks/useDashboardQuery.ts
export function useDashboardQuery<T>(
  endpoint: string,
  params: Record<string, string>
) {
  return useQuery<T>({
    queryKey: ['dashboard', endpoint, params],
    queryFn: () => api.get(`/v1/admin/dashboard/${endpoint}`, { params }).then(r => r.data),
    staleTime: 60_000,           // 1분 동안은 fresh
    refetchOnWindowFocus: false, // 대시보드는 의도적 새로고침만
  });
}
```

### 8.5 ECharts 옵션 빌더는 순수 함수

```ts
// lib/charts/order-trend.ts
import type { EChartsOption } from 'echarts';

export function buildOrderTrendOption(data: OrderTrendResponse): EChartsOption {
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['주문', '결제완료', '취소', '주문(전기)', '결제완료(전기)'] },
    xAxis: { type: 'category', data: data.current.map(d => d.date) },
    yAxis: { type: 'value' },
    series: [
      { name: '주문', type: 'line', data: data.current.map(d => d.ordered) },
      { name: '결제완료', type: 'line', data: data.current.map(d => d.paid) },
      { name: '취소', type: 'line', data: data.current.map(d => d.cancelled) },
      ...(data.previous ? [
        { name: '주문(전기)', type: 'line', lineStyle: { type: 'dashed' },
          data: data.previous.map(d => d.ordered) },
        { name: '결제완료(전기)', type: 'line', lineStyle: { type: 'dashed' },
          data: data.previous.map(d => d.paid) },
      ] : []),
    ],
  };
}
```

→ 컴포넌트는 `<ReactECharts option={buildOrderTrendOption(data)} />` 한 줄. 옵션 빌더는 순수 함수라 단위 테스트 가능.

---

## 9. 차트별 상세 설계

### 9.1 KPI 카드 4개

| 카드 | 산출 | Delta 기준 |
|------|------|-----------|
| 오늘 주문 수 | `COUNT(*) FROM orders WHERE created_at = today` | 어제 같은 시각까지 |
| 오늘 매출 | `SUM(total_amount) FROM orders WHERE paid_at = today` | 어제 같은 시각까지 |
| 미처리 배송 | `COUNT(*) FROM orders WHERE status = 'paid'` | 24시간 전 대비 |
| 로그인 실패율 | audit_logs 오늘 FAILED / (LOGIN+FAILED) × 100 | 어제 동시간대 |

UI: `value` 큼지막 / `deltaPercent` 우상단 작게 (양수=초록↑, 음수=빨강↓, 단 실패율은 부호 반대로 색).

### 9.2 Chart 1 — 일별 주문/결제 (꺾은선)

- **3 series** 실선 (주문/결제완료/취소) + **2 series** 점선 (전기 주문/결제완료)
- `compareWithPrevious=true`일 때만 점선 노출
- 클릭 시: `/admin/audit-logs?action=ORDER_CREATED&startDate=...&endDate=...`로 드릴다운

### 9.3 Chart 2 — 보안 (Bar + Line, 이중 Y축)

- 왼쪽 Y축 (Bar): FAILED_LOGIN, ACCOUNT_LOCKED 일별 건수
- 오른쪽 Y축 (Line): 실패율 %
- `markLine: { yAxisIndex: 1, data: [{ yAxis: 10, label: '경고선' }] }` 로 10% 임계선 표시
- 실패율이 임계선 위로 올라간 날의 막대는 색을 다르게 (`itemStyle.color` 함수)

### 9.4 Chart 3 — 결제 전환 펀넬

- ECharts `series: { type: 'funnel' }` 사용
- 5단계: created → paid → shipped → delivered → completed
- 각 단계에 `count`, `rate(1단계 대비 %)`, `dropRate(직전 대비 이탈 %)` 라벨 표시
- 우측 사이드 정보: 별도 Cancelled 카운트 (펀넬 밖에 표시)

### 9.5 Chart 4 — 카테고리별 매출 (트리맵)

- ECharts `series: { type: 'treemap' }` 사용
- 박스 크기: `revenue`
- 박스 색: `deltaPercent`에 따라
  - `> +10%`: 진한 초록
  - `0 ~ +10%`: 연한 초록
  - `-10 ~ 0%`: 노랑
  - `< -10%`: 빨강
- 라벨: `카테고리명\n매출 ₩x,xxx,xxx (▲12.3%)`
- 클릭 시: `/admin/orders?categoryId=...&startDate=...&endDate=...` 드릴다운

---

## 10. 성능 / 캐싱 / 인덱스

### 10.1 추가 필요 인덱스 (orders)

```sql
CREATE INDEX IF NOT EXISTS idx_orders_created_at  ON orders (created_at);
CREATE INDEX IF NOT EXISTS idx_orders_paid_at     ON orders (paid_at) WHERE paid_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders (status, created_at);
```

→ TypeORM 엔티티의 `@Index()`로도 추가 가능. `synchronize: true` 환경이라 dev에서는 자동 생성.

### 10.2 Redis 캐싱

| 엔드포인트 | TTL | 키 |
|-----------|-----|-----|
| /kpi | 60초 | `dashboard:kpi:{date}` |
| /order-trend | 5분 | `dashboard:trend:{start}:{end}:{compare}` |
| /security | 5분 | `dashboard:security:{start}:{end}` |
| /funnel | 10분 | `dashboard:funnel:{start}:{end}` |
| /category-revenue | 30분 | `dashboard:revenue:{start}:{end}` |

> 구현은 `CacheInterceptor` 또는 단순 `redis.get/set` 래퍼. 신입 수준에서는 후자가 디버깅 쉬움.

### 10.3 기간 검증
- 최대 90일 (DTO에서 거부) — 그 이상은 클라이언트에서 분할 요청 유도
- startDate ≤ endDate
- 미래 날짜는 허용 (오늘까지의 데이터만 반환됨)

### 10.4 응답 크기
- 90일 × 일별 = 90 row, 한 row 100B 미만 → 응답 < 10KB. gzip 불필요.

---

## 11. 구현 순서

### Phase 0 — 사전 정리 ✅ 완료 (인수인계 §1.1, §1.2 참고)
- [x] `frontend/package.json`에 `echarts`, `echarts-for-react` 추가 후 설치
- [x] `frontend/src/app/(main)/admin/*` 폴더 **완전 삭제** (URL은 `(admin)/admin/*`로 이동)
- [x] `(admin)/layout.tsx` 신규 작성 (셸만 — 서버 검증 없음)
- [x] `frontend/src/middleware.ts` 신규 (refreshToken 존재 체크)
- [x] BFF 3개 라우트 + 헬퍼 (`/api/auth/login`, `/logout`, `/refresh`, `_lib/cookie.ts`)
- [x] `AdminGuard.tsx` (Client Component) 신규 — `/auth/me` + `roles[].name === 'admin'` 검증

> ⚠️ 원래 설계의 `(admin)/layout.tsx` ADMIN 서버 검증과 `/api/auth/me` BFF 라우트는 token rotation 이슈로 **폐기됨** (§4 참고).

### Phase 1 — KPI 카드 ✅ 완료
- [x] 백엔드 `admin.module.ts`, `dashboard.controller.ts`, `dashboard.service.ts` 골격
- [x] `GET /v1/admin/dashboard/kpi` 구현 (KST 변환 헬퍼 포함)
- [x] DTO 검증 + ADMIN 가드 적용
- [x] 프론트 `KpiCards.tsx` + `useDashboardQuery` 훅
- [x] dashboard `page.tsx`에 마운트 → 동작 확인

### Phase 2 — 일별 주문/결제 꺾은선 ✅ 완료
- [x] 백엔드 `/order-trend` 구현 (compare 옵션 포함)
- [x] `fillEmptyDates` 헬퍼
- [x] 프론트 `lib/charts/order-trend.ts` 옵션 빌더
- [x] `OrderTrendChart.tsx` 컴포넌트 (`dynamic({ ssr: false })` + `notMerge`)
- [x] `DashboardFilters.tsx` (7d/30d/custom + URL push, compare 토글)
- [x] `useDateRange.ts` 훅 (URL → DateRange)

### Phase 3 — 보안 차트 (이중 Y축) ✅ 완료
- [x] **3-B 백엔드**:
    - [x] `dto/security-response.dto.ts` 신규 (SecurityPointDto + SecurityResponseDto)
    - [x] `dashboard.service.ts`에 `getSecurity()` 추가 — failureRate 서비스 레이어 계산
    - [x] `dashboard.controller.ts`에 `@Get('security')` + `@Serialize(SecurityResponseDto)`
- [x] **3-C 프론트**:
    - [x] `service/admin-dashboard.ts`에 `SecurityPoint`, `SecurityResponse`, `SecurityParams`, `fetchSecurity` 추가
    - [x] `hooks/useDashboardQuery.ts`에 `useSecurityQuery` 추가 (staleTime 5분)
    - [x] `lib/charts/security.ts` 옵션 빌더 — 이중 Y축 + stacked bar(failed+locked) + line(failureRate) + markLine 10%
    - [x] 임계 초과 막대 색 변경 (itemStyle.color 함수, 10% 초과 시 빨강)
    - [x] `SecurityChart.tsx` 컴포넌트
    - [x] `dashboard/page.tsx`에 Suspense로 마운트
- [x] **엣지케이스 수정**: `security.ts` `tooltip.formatter` / `itemStyle.color` null guard 추가
    - ECharts 옵션 교체 중 이전 dataIndex로 콜백 호출 시 throw 방지
    - 동일 패턴을 Phase 4~5 차트 옵션 빌더에도 적용할 것

### Phase 4 — 펀넬
- [ ] 백엔드 `/funnel` 구현 (코호트 단일 쿼리)
- [ ] 단계별 rate / dropRate 계산
- [ ] 프론트 `FunnelChart.tsx`, 옵션 빌더

### Phase 5 — 카테고리 트리맵
- [ ] 백엔드 `/category-revenue` 구현 (먼저 leaf 카테고리 v1)
- [ ] 전기 대비 deltaPercent 계산
- [ ] 프론트 `CategoryRevenueChart.tsx`, 색상 매핑

### Phase 6 — 확장 UX
- [ ] 데이터 갱신 시점 표시 (`DataFreshness.tsx`)
- [ ] 차트 클릭 드릴다운 (audit-logs / orders 페이지 라우팅)
- [ ] CSV 내보내기 엔드포인트 (`.csv` suffix) + 프론트 다운로드 버튼

### Phase 7 — 캐싱 / 인덱스
- [ ] orders 인덱스 추가
- [ ] Redis 캐싱 적용 (TTL 차등)
- [ ] 부하 테스트 (90일 기준 응답 시간 측정)

---

## 12. 알려진 한계 & 향후 개선

| 한계 | 영향 | 향후 |
|------|------|------|
| `order_items`에 카테고리 스냅샷 없음 | 카테고리 매출이 현재 카테고리로 변동 | 스냅샷 컬럼 추가 (`category_id_snapshot`) |
| 카테고리 두 체계 (`ProductCategory` enum vs `categories` 테이블) | 트리맵 그룹핑 기준 모호 | enum 폐기 또는 categories만 사용으로 통일 |
| BFF + rewrites 혼용 | 복잡도 증가 | Nginx + HTTPS 전환 후 BFF 단순화 검토 |
| 미들웨어가 role 검증 못함 | layout에서 1회 추가 RTT | 별도 ADMIN 전용 토큰 또는 JWT를 쿠키로 이동 (큰 리팩토링) |
| `synchronize: true` (dev) | prod에서 kill | migration 도입 (포트폴리오 외 작업) |
| Redis 의존 | Redis 다운 시 fallback 없음 | try/catch로 cache miss 처리, DB 직접 조회 |
| audit_logs 90일치 GROUP BY | 데이터 폭증 시 느려질 수 있음 | 일별 사전 집계 테이블(`audit_daily_stats`) — Cron으로 새벽 집계 |

## 13. Seed 데이터

### 13.1 목적 — 왜 시드가 필요한가

대시보드의 5개 차트(KPI·꺾은선·보안·펀넬·트리맵)는 모두 DB 집계 쿼리 결과를 렌더링한다.
DB가 비어 있으면 모든 차트가 0 또는 빈 배열을 반환하여 **구현이 올바른지 눈으로 확인할 수 없다**.

시드 데이터의 목적은 세 가지다:
1. **시각적 검증** — 차트가 그려지는지, 색상·축·markLine이 정상 동작하는지
2. **로직 검증** — KST 자정 경계, fillEmptyDates, failureRate 계산, 상태 전이가 올바른지
3. **비교 검증** — compare 토글, deltaPercent, 전기 대비 점선이 정합성 있게 동작하는지

### 13.2 파일 구조

```
backend/src/seed/
├── seed-helpers.ts           ── rand, randomKstTime, addMinutes/Hours/Days
├── dashboard.seed.service.ts ── 모든 시드 로직 (NestJS 서비스)
└── seed.module.ts            ── NODE_SEED=true 시 AppModule 에 주입
```

`AppModule` 은 `NODE_SEED === 'true'` 일 때만 `SeedModule` 을 import 한다.
시드 완료 후 `process.exit(0)` 으로 종료 — HTTP 서버가 뜨기 전에 빠져나온다.

### 13.3 실행 방법

```bash
# 1단계: 개발 빌드 (이미 빌드된 경우 생략 가능)
npx nx run backend:build:development

# 2단계: 시드 실행 (30일치 기본값)
npx nx run backend:seed

# 재실행 (기존 시드 데이터 삭제 후 재생성)
npx nx run backend:seed:reset

# 일수 변경: env 직접 지정
NODE_SEED=true SEED_DAYS=7 node backend/dist/main.js
```

**Windows PowerShell 에서 env 직접 설정하는 경우:**
```powershell
$env:NODE_SEED="true"; $env:SEED_DAYS="30"; node backend/dist/main.js
```

> ⚠️ `npx nx run backend:seed` 는 `dist/main.js` 를 실행하므로 **반드시 빌드가 먼저** 되어 있어야 한다.
> 빌드 없이 바로 실행하려면 `npx nx run backend:build:development` 를 먼저 실행할 것.

### 13.4 환경 변수

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `NODE_SEED` | (없음) | `true` 이면 시드 실행 후 종료 |
| `SEED_DAYS` | `30` | 오늘 기준 과거 N일치 데이터 생성 |
| `SEED_RESET` | (없음) | `true` 이면 기존 시드 데이터 삭제 후 재생성 |

### 13.5 생성 데이터 전체 구조

#### 사용자 / 셀러

| 대상 | 수 | email 패턴 | 비고 |
|------|---|-----------|------|
| 일반 사용자 | 20명 | `user1@seed.com` ~ `user20@seed.com` | BUYER role, 이메일 인증 완료 |
| 셀러 사용자 | 5명 | `seller1@seed.com` ~ `seller5@seed.com` | SELLER role + sellers 테이블 레코드 |
| 비밀번호 공통 | — | `Seed1234!` | 테스트 로그인 시 사용 |

#### 주문 (orders + order_items)

| 항목 | 값 | 설명 |
|------|---|------|
| 일별 주문 수 | 5~20건 (무작위) | 꺾은선이 평탄하지 않게 |
| 총 주문 수 | 약 350~600건 (30일 기준) | |
| 아이템 수 | 주문당 1~2개 | subtotal = 단가 × 1 |
| productId | `999999` (더미) | FK 없음 — Phase 5 구현 시 교체 |
| memo 패턴 | `[SEED] 시드주문` | 삭제 시 `memo LIKE '[SEED]%'` 기준 |

**주문 상태 전이 확률:**

```
100% → ORDER_CREATED (주문 생성)
 ├─  5% → CANCELLED    (cancelledAt 설정)
 ├─ 70% → PAID         (paidAt 설정, paid ~ 30분 후)
 │    └─ 80% → SHIPPED      (shippedAt 설정, 2~24시간 후)
 │         └─ 80% → DELIVERED   (deliveredAt 설정, 12~48시간 후)
 │              └─ 70% → COMPLETED  (completedAt 설정, 1~7일 후)
 └─ 25% → PENDING_PAYMENT (타임스탬프 모두 null)
```

#### audit_logs

| action | 건수/일 | 조건 |
|--------|--------|------|
| `ORDER_CREATED` | 주문 수와 1:1 | 주문 생성 시 함께 삽입 |
| `PAYMENT_VERIFIED` | 결제 주문 수 (≈70%) | paidAt 있는 주문과 동기 |
| `ORDER_CANCELLED` | 취소 주문 수 (≈5%) | cancelledAt 있는 주문과 동기 |
| `LOGIN` | 30~80건 | KST 09~23시 분포 |
| `FAILED_LOGIN` | LOGIN × 7% (평상시) | d-10, d-20 에는 22% 로 spike |
| `ACCOUNT_LOCKED` | 2~4건 | d-10, d-20 에만 삽입 |

**식별 마커 (멱등성 및 삭제용):**
- `audit_logs.metadata = { "seed": "v1" }` — `metadata::jsonb->>'seed' = 'v1'` 조건으로 일괄 삭제
- `orders.memo LIKE '[SEED]%'` — 주문 삭제 기준

### 13.6 시간 분포 설계

```
왜 KST 기준으로 시각을 생성하는가?

대시보드 SQL이 'AT TIME ZONE Asia/Seoul' 로 GROUP BY 한다.
UTC 기준 시각을 무작위 생성하면 한국 자정(00:00 KST = 15:00 UTC 전날)과
어긋나 "어제 데이터가 오늘 날짜에 잡히는" 버그가 발생한다.

seed-helpers.ts 의 randomKstTime(daysAgo) 는:
1. 오늘 KST 날짜를 구함
2. daysAgo 만큼 빼서 목표 날짜를 KST 기준으로 결정
3. 그 날 KST 09~23시 사이의 무작위 시각을 new Date('...+09:00') 로 생성
   → JavaScript 가 자동으로 UTC 로 변환하여 DB에 저장됨
```

- 주문 생성: KST 09:00~23:00 (쇼핑몰 운영 시간대)
- 결제: 주문 후 1~30분
- 출고: 결제 후 2~24시간
- 배송완료: 출고 후 12~48시간
- 구매확정: 배송완료 후 1~7일

### 13.7 의도된 이상치 (차트 검증 마커)

| 날짜 | 이상치 내용 | 검증 목적 |
|------|-----------|---------|
| d-10 (오늘~10일 전) | FAILED_LOGIN 22%, ACCOUNT_LOCKED 2~4건 | 보안 차트 markLine 초과 → 빨간 막대 |
| d-20 (오늘~20일 전) | FAILED_LOGIN 22%, ACCOUNT_LOCKED 2~4건 | 동일 — 두 곳 검증으로 재현성 확인 |
| 나머지 날 | FAILED_LOGIN 7% | 정상 범위 (10% 이하) → 주황 막대 |

### 13.8 실제 데이터 예시 (샘플)

**orders 테이블 (발췌):**
```
order_number          | user_id | status    | total_amount | paid_at             | "createdAt"
SEED-20260418-000-7231| 3       | completed | 39800        | 2026-04-18 09:32:00 | 2026-04-18 09:31:00
SEED-20260418-001-5412| 7       | shipped   | 19900        | 2026-04-18 14:05:00 | 2026-04-18 14:03:00
SEED-20260418-002-9871| 12      | cancelled | 29900        | null                | 2026-04-18 16:47:00
SEED-20260419-000-3309| 2       | paid      | 49900        | 2026-04-19 11:21:00 | 2026-04-19 11:20:00
```

**audit_logs 테이블 (발췌):**
```
action           | userId | success | "createdAt"          | metadata
ORDER_CREATED    | 3      | true    | 2026-04-18 09:31:00  | {"seed":"v1"}
PAYMENT_VERIFIED | 3      | true    | 2026-04-18 09:32:00  | {"seed":"v1"}
ORDER_CANCELLED  | 12     | true    | 2026-04-18 16:52:00  | {"seed":"v1"}
LOGIN            | 5      | true    | 2026-04-18 10:15:00  | {"seed":"v1"}
FAILED_LOGIN     | null   | false   | 2026-04-18 23:41:00  | {"seed":"v1"}
ACCOUNT_LOCKED   | 9      | false   | 2026-04-18 22:30:00  | {"seed":"v1"}  ← d=10 spike
```

### 13.9 이 데이터로 검증할 수 있는 것

| 차트 | 검증 항목 |
|------|---------|
| **KPI 4카드** | 오늘 주문/매출이 0이 아닌 숫자로 표시되는가, deltaPercent ▲▼ 방향이 맞는가 |
| **일별 꺾은선** | 30일치 3 시리즈(주문/결제/취소)가 그려지는가, fillEmptyDates 가 0으로 채워지는가, compare 토글 시 전기 점선 2개가 나타나는가 |
| **보안 차트** | 이중 Y축이 분리되는가, d-10·d-20 막대가 빨강으로 바뀌는가, markLine 10% 선이 표시되는가 |
| **KST 경계** | 23:59 KST 데이터가 전날 날짜로, 00:01 KST 데이터가 당일 날짜로 잡히는가 (`fillEmptyDates` + KST 변환 검증) |
| **Phase 4 펀넬** | created → paid → shipped → delivered → completed 5단계 전환율이 확률과 근사하는가 |

### 13.10 멱등성 / 재실행

시드를 두 번 돌리면 데이터가 중복 삽입된다. 이를 방지하는 두 가지 안전장치:

1. **실행 전 체크**: `audit_logs WHERE metadata::jsonb->>'seed' = 'v1'` 건수 > 0 이면 이미 삽입된 것으로 보고 즉시 종료
2. **SEED_RESET=true**: `[SEED]` 마커 + `@seed.com` 이메일 기준으로 관련 레코드를 전량 삭제 후 재삽입

```bash
# 확인: 시드 데이터 존재 여부
psql -d <db> -c "SELECT COUNT(*) FROM audit_logs WHERE metadata::jsonb->>'seed' = 'v1';"

# 재실행
npx nx run backend:seed:reset
```

### 13.11 Phase별 seed 확장 계획

| Phase | 추가 필요 데이터 | 작업 |
|-------|--------------|------|
| Phase 1~3 (현재) | users, sellers, orders, order_items, audit_logs | ✅ 완료 |
| Phase 4 (펀넬) | 추가 없음 — 기존 orders 상태 전이 데이터 재사용 | 코드 변경 없이 바로 검증 가능 |
| Phase 5 (트리맵) | categories (이미 CategorySeedService 로 생성됨), products | `order_items.productId` 를 실제 products 레코드로 교체 필요 |
| Phase 6 (드릴다운) | 추가 없음 — 클릭 이벤트 + URL 라우팅만 구현 | — |

**Phase 5 전환 시 해야 할 일:**
1. `backend/src/common/seeds/product.seed.ts` 에서 생성된 productId 목록을 조회
2. `dashboard.seed.service.ts` 의 `productId: 999999` 를 실제 ID 중 무작위 값으로 교체
3. `order_items.subtotal` 이 실제 product 가격과 일치하도록 수정

### 13.12 변경 이력

| 날짜 | 버전 | 변경 |
|------|-----|------|
| 2026-04-28 | v1 | Phase 1~3 검증용 최초 작성, 실제 코드 완성 |

---

## 부록 A — 다음 컨텍스트 시작 시 사용할 한 줄 요약

> 본 문서를 따라 Phase 3부터 순차 구현. 다음 타깃은 보안 차트 (`/v1/admin/dashboard/security` → `SecurityChart.tsx`).
> 본 문서와 `Design_Dashboard_Handoff_2.md`가 진실의 원천. 어긋나는 부분은 본 문서를 먼저 갱신한 뒤 코드 작업 진행.

## 부록 B — Phase 2까지 구현 결과와 본 설계의 차이 요약

| 영역 | 원래 설계 | 실제 구현 | 사유 |
|------|---------|---------|------|
| AdminLayout 검증 | Server Component에서 `/v1/auth/me` | Client Component(`AdminGuard.tsx`) | Server Component가 Set-Cookie 못해 token rotation DoS |
| BFF 라우트 | login/logout/refresh/me 4개 | login/logout/refresh + `_lib/cookie.ts` | `/me`는 axios 인터셉터가 처리해 불필요 |
| 컬럼명 표기 | `created_at` (snake_case) | `"createdAt"` (camelCase + 쌍따옴표) | TypeORM 엔티티가 camelCase property |
| numeric 캐스팅 | 묵시적 | SQL `::text` + 서비스 `Number()` | driver별 응답 타입 차이 흡수 |
| failureRate 계산 위치 | SQL (NULLIF + ROUND) | 서비스 레이어 | fillEmptyDates와 분모 0 처리 단일 지점화 |
| QueryBuilder | QueryBuilder + getRawMany | raw SQL + `repo.query()` | 가독성·디버깅 우수, 신입 친화적 |
