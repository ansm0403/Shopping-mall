# 관리자 대시보드 설계 — 두 번째 컨텍스트 대화 로그

> 본 문서는 첫 번째 설계 컨텍스트(`Design_Dashboard_log.md`)를 이어받아, 실제 구현 직전까지의 설계 검증과 결정 사항을 정리한 대화 기록이다.
> 다음 컨텍스트에서 실제 구현을 진행할 때 참고한다.

---

## 목차

1. [이전 설계 검증 1차](#1-이전-설계-검증-1차)
2. [결정 사항 검토 (5개 항목)](#2-결정-사항-검토-5개-항목)
3. [localStorage vs httpOnly Cookie + Next Middleware](#3-localstorage-vs-httponly-cookie--next-middleware)
4. [Vercel + EC2 환경의 BFF 패턴](#4-vercel--ec2-환경의-bff-패턴)
5. [그래프 시각화 설계 (4개 + KPI)](#5-그래프-시각화-설계-4개--kpi)
6. [API/DB/프론트 데이터 흐름 + 성능 고려사항](#6-apidb프론트-데이터-흐름--성능-고려사항)
7. [다음 컨텍스트로 넘기는 종합 컨텍스트](#7-다음-컨텍스트로-넘기는-종합-컨텍스트)

---

## 1. 이전 설계 검증 1차

### Q. 사용자 질문

> 나는 프론트엔드 UI 로 관리자 대시보드를 설계 및 구현하려고 한다.
>
> 이미 이전 컨텍스트에서 이에 대한 대화를 어느 정도 나누었다. 아래는 이전 컨텍스트에서 정리한 요구사항이다.
>
> [프로젝트 스택]
> * 백엔드: NestJS + TypeScript + PostgreSQL + TypeORM + Redis + JWT (BUYER/SELLER/ADMIN 3-roles)
> * 프론트엔드: Next.js (관리자 페이지 첫 구현)
> * 구조: Nx 모노레포, PortOne 결제, 멀티 셀러 오픈마켓
> * 배포 현황: frontend 는 vercel, backend 는 AWS EC2 (backend 폴더 전체를 로컬에서 이미지화 후 EC2 에서 가져와서 실행. 시간관계상 nginx 사용 X, next.config.js 에서 프록시 설정)
>
> [이미 구현된 자산 (재활용)]
> * AuditService, AuditLogEntity — 61개 AuditAction enum, @Auditable() 자동 로깅
> * GET /v1/admin/audit-logs 엔드포인트 (Admin 권한)
> * JwtAuthGuard, RolesGuard, @Roles(Role.ADMIN) 데코레이터
>
> [그래프 4개 (확정)]
> * 일별 주문/결제 현황 — 꺾은선
> * 로그인 보안 현황 — 막대
> * 결제 전환 펀넬 — Funnel
> * 카테고리별 매출 비중 — Treemap (멀티셀러 차별화 지표)
>
> [UX 요구사항]
> * 필수: 기간 필터, 전기 대비 비교, 데이터 갱신 시점 표시
> * 확장: 드릴다운, CSV 내보내기
>
> [컨텍스트에서 설계할 것]
> * 폴더/라우팅: Next.js App Router에서 일반 페이지 vs 관리자 페이지 분리 (route group)
> * 인증/인가: 초기 ADMIN 계정 설정 방법, 미들웨어/레이아웃 가드, 다른 유저 ADMIN 승격 기능
> * 확장성 구조: 데이터 fetch 패턴, 필터 상태 관리, 드릴다운 라우팅, CSV API 응답
>
> [설계 원칙]
> * 신입 + 시간 제약 → 과한 추상화 금지
> * 라이브러리는 학습 곡선 낮은 것 우선 (Recharts, React Query 등. 하지만 그래프를 그리는 라이브러리는 이번 구현에서 핵심이기때문에 실무를 기준으로 추천하거나 너의 추천하는 라이브러리를 사용해도 좋다.)
> * 외부 도구(ELK/Datadog) 도입 금지
> * 백엔드 + 프론트 양쪽 가드 (백엔드가 진실의 원천)
>
> 위 내용을 기반으로,
> 👉 내가 이해한 방향이 올바른지 검증해달라.

### A. 검증 결과 (요약)

**잘 잡은 부분:**
- audit_logs를 활용한 백엔드 진실의 원천 설계
- 그래프 1·2(주문/결제, 로그인 보안)는 audit_logs와 자연스럽게 매핑
- 기간 필터를 URL 쿼리 파라미터로 두는 것
- 외부 도구 도입 금지 원칙

**빠진/잘못된 핵심 요소:**

1. **현재 라우팅이 이미 `(main)/admin/*`로 묶여있음** — 가정과 코드가 어긋남
   - `frontend/src/app/(main)/admin/layout.tsx`가 이미 존재 (패스스루)
   - 결과적으로 MainLayout의 Header/Footer가 admin 페이지에도 적용됨
   - **수정 방향**: `app/(admin)/admin/*` 별도 route group, 새 레이아웃 작성

2. **프론트엔드 가드가 전혀 없음** — `middleware.ts` 부재
   - 비로그인 상태에서도 admin 페이지가 일단 렌더됨
   - **수정 방향**: middleware 1차 redirect, layout 서버 컴포넌트 2차 ADMIN 검증, 백엔드 가드 3차

3. **그래프 4 (카테고리별 매출 비중)은 audit_logs로 풀면 부정확**
   - audit_logs metadata에 매출 금액·카테고리 일관성 보장 X
   - **수정 방향**: orders + order_items + categories JOIN

4. **결제 전환 펀넬 — 단순 카운트 vs 코호트 기반 미결정**
   - 단순 카운트는 다른 주문 그룹 비교가 됨
   - **수정 방향**: orderId 기준 코호트로 집계

5. **Recharts에는 Funnel 차트가 없음**
   - 선택지: ECharts 통일 vs Recharts + horizontal stacked bar로 흉내내기

**실무 보완 포인트:**

- ADMIN 승격 기능: privilege escalation 경로 → audit log 필수, sudo-mode, 마지막 ADMIN 강등 금지
- 첫 ADMIN은 env 기반 시드 (`ADMIN_INITIAL_EMAIL`)
- 백엔드 stats API 모듈 위치: 별도 `admin` 모듈 권장
- "데이터 갱신 시점"은 React Query `dataUpdatedAt` 사용
- CSV 내보내기는 별도 엔드포인트 권장
- Vercel ↔ EC2 프록시 latency: Server Component에서 묶어 fetch

---

## 2. 결정 사항 검토 (5개 항목)

### Q. 사용자 결정

> 1. **Route Group 분리**
>    * 관리자 페이지는 `(admin)` route group으로 분리하고, 기존 `(main)/admin/*` 폴더는 `(admin)/admin/*`로 이동합니다.
>
> 2. **그래프별 데이터 소스**
>    * 그래프 1·2·3: `audit_logs` 기반
>    * 그래프 4: `orders + order_items` 도메인 테이블 기반
>
> 3. **펀넬 계산 방식**: 코호트 기반으로 구현합니다.
>
> 4. **차트 라이브러리**: ECharts로 통일합니다.
>
> 5. **JWT payload 확인**: `auth.service.ts`의 296번째줄 generateTokens 함수를 확인한 결과, JWT payload에 `roles`가 포함되어 있습니다.

### A. 검증 결과

**결정 1 (Route Group 분리)**: ✅ 맞음
- `(main)/admin/*` → `(admin)/admin/*` 이동 시 URL 변화 없음
- 새 레이아웃은 쇼핑몰 헤더/푸터 없는 사이드바 콘솔 레이아웃이어야 함

**결정 2 (데이터 소스)**: ⚠️ 그래프 3도 orders 테이블이 맞음
- `orders` 테이블에 이미 `paidAt`, `shippedAt`, `deliveredAt`, `completedAt` 타임스탬프 컬럼 존재
- audit_logs에서 orderId 추적할 필요 없이 orders 테이블 단일 쿼리로 코호트 펀넬 가능
- 최종 매핑:

  | 그래프 | 데이터 소스 |
  |--------|-----------|
  | 1. 일별 주문/결제 | audit_logs |
  | 2. 로그인 보안 | audit_logs |
  | 3. 결제 전환 펀넬 | orders (timestamp 컬럼 집계) |
  | 4. 카테고리별 매출 | orders + order_items + categories |

**결정 3 (코호트 펀넬)**: ✅ 맞음. 다만 위에서 언급한 것처럼 데이터 소스는 orders 테이블.

**결정 4 (ECharts)**: ✅ 맞음

**결정 5 (JWT roles)**: ⚠️ 미들웨어에서 활용 불가
- `auth.controller.ts` 확인 결과 `accessToken`은 응답 body, `refreshToken`만 httpOnly 쿠키
- 미들웨어는 쿠키만 읽을 수 있음 → accessToken 못 읽음 → roles 판정 불가
- **실제 구조**:
  - middleware → `refreshToken` 존재만 체크
  - layout 서버 컴포넌트 → `/v1/auth/me` 호출하여 ADMIN 판정
  - 백엔드 RolesGuard → 진실의 원천

**놓친 항목**: 백엔드 stats API 모듈 위치
- 데이터 소스가 두 테이블에 걸쳐있어 별도 `admin` 모듈 신규 작성 권장
- `audit` 모듈에 넣으면 orders 의존성이 섞임

---

## 3. localStorage vs httpOnly Cookie + Next Middleware

### Q. 사용자 질문

> 현재 accessToken을 브라우저 저장소에 저장하는 구조를 사용하고 있습니다.
> 이유는 BroadcastChannel과 storage 이벤트를 활용하여 탭 간 인증 상태 동기화를 구현하기 위함입니다.
>
> 관련 코드:
> * `frontend/src/service/auth-storage.ts`
> * `frontend/src/service/auth-channel.ts`
>
> 1. 현재 구조처럼 accessToken을 브라우저 저장소(localStorage 등)에 두는 경우, Next middleware에서 roles 정보를 활용하는 것이 구조적으로 어려운가요?
> 2. 만약 어렵다면, httpOnly 쿠키 기반으로 변경하는 것이 사실상 필수적인 선택인가요?
> 3. 현재 구조를 유지하면서도 middleware에서 인증/권한 체크를 구현할 수 있다면, httpOnly 쿠키 방식과 비교했을 때 복잡도가 얼마나 증가하나요? (구현 난이도, 유지보수, 보안 측면 포함)

### A. 답변 요약

**Q1**: localStorage 기반에서 미들웨어 roles 활용은 **구조적으로 거의 불가능**
- Next.js middleware는 Edge Runtime에서 실행 → `window`, `localStorage`, `sessionStorage` 접근 불가
- 미들웨어가 읽을 수 있는 것은 HTTP 요청에 실린 것뿐 (쿠키, 헤더, URL)

**Q2**: httpOnly 쿠키 변경은 **필수가 아님**. 현재 구조 유지하면서 구현 가능

**Q3**: 두 방식 비교

| 항목 | 현재 (localStorage) | httpOnly 쿠키 |
|------|-------------------|--------------|
| middleware에서 role 체크 | ❌ 직접 불가 | ✅ JWT 직접 파싱 |
| XSS 토큰 탈취 위험 | ⚠️ JS로 접근 가능 | ✅ JS 접근 불가 |
| 탭 간 동기화 | BroadcastChannel 필요 | ✅ 쿠키 자동 공유 |
| Server Component 활용 | ❌ 서버에서 토큰 없음 | ✅ `cookies()` 직접 |
| 전환 비용 | — | 백엔드+프론트 전체 수정 |

**추천 방향**: 현재 구조 유지 + 두 레이어 분리

```
middleware.ts
  └─ refreshToken 쿠키 존재 여부만 확인 (있으면 통과)

app/(admin)/admin/layout.tsx (Server Component)
  └─ GET /v1/auth/me 호출 → roles에 'admin' 없으면 redirect
```

이유:
1. auth-storage, auth-channel이 이미 잘 구현되어 작동 중
2. 관리자는 동시 사용자 1~2명 → latency 무시 가능
3. 보안은 백엔드 `@Roles(Role.ADMIN)` 가드가 최종 방어선
4. httpOnly 쿠키 전환은 인증 아키텍처 전반 리팩토링이라 ROI 낮음

---

## 4. Vercel + EC2 환경의 BFF 패턴

### Q. 사용자 질문

> 현재 로컬 환경에서는 프론트엔드 + 백엔드를 함께 실행하고 있어 httpOnly 쿠키가 정상적으로 동작합니다.
>
> 하지만 배포 환경은 다음과 같이 구성되어 있습니다:
> * 프론트엔드: Vercel (HTTPS)
> * 백엔드: Amazon EC2 (HTTP, http://[퍼블릭 IP]:4000/v1)
> * Mixed Content 문제를 우선 해결하기 위해 next.config.js에 프록시 설정을 적용한 상태 (시간 부족으로 인한 어쩔 수 없는 선택)
>
> 이 구조 때문에 백엔드에서 설정한 httpOnly 쿠키가 브라우저에 정상적으로 저장되지 않거나, 요청에 포함되지 않을 가능성이 있다고 판단하고 있습니다.
>
> 고려 중인 대안: Next API Route를 중간에 두고 쿠키를 "재설정"하는 BFF 패턴
> 1. 브라우저 → Next (/api/login)
> 2. Next → 백엔드 (로그인 요청)
> 3. 백엔드 → Next (토큰 응답)
> 4. Next → 브라우저 (Set-Cookie로 refreshToken 설정)
>
> 이 방식(BFF 패턴, Next에서 쿠키 재설정)에 대해 어떻게 생각하시나요?
> * 현재 배포 환경에서 현실적인 해결책으로 적절한지
> * 혹은 더 나은 대안이 있는지
> * 추후 Nginx + HTTPS 환경으로 전환했을 때 구조 변경이 필요한지

### A. 답변 요약

**우려가 타당함**: Next.js `rewrites()`는 Vercel Edge Network에서 실행되는 URL 레벨 프록시로, upstream의 `Set-Cookie` 포워딩이 환경에 따라 불안정함.

**BFF 패턴 평가**: 현재 환경에서 가장 현실적이고 정확한 해결책

**핵심 인사이트**: Next.js API Routes는 `rewrites()`보다 우선
- `src/app/api/auth/login/route.ts` 파일 만들면 `/api/auth/login` 요청은 rewrite 대신 API Route로 감
- `rewrites()` 설정 손대지 않아도 됨
- axios `baseURL = '/api'` 그대로 유지

**변경 범위**: 쿠키 관여 auth 엔드포인트 3개만

```
frontend/src/app/api/auth/
  login/route.ts       ← 신규
  logout/route.ts      ← 신규
  refresh/route.ts     ← 신규
```

각 API Route 역할:
- **login**: EC2 호출 → accessToken 추출 → refreshToken을 Vercel 도메인 기준으로 Set-Cookie → accessToken만 body 반환
- **refresh**: refreshToken 쿠키 읽기 → EC2에 Cookie 헤더로 전달 → 새 accessToken 반환 + 새 refreshToken 재설정
- **logout**: EC2 로그아웃 → refreshToken maxAge=0으로 삭제

**Nginx + HTTPS 전환 후**:
- Case 1 (같은 루트 도메인, www.+api. 서브도메인): BFF 불필요, 직접 호출 가능
- Case 2 (별도 도메인): BFF 유지가 더 단순. SameSite=None+CSRF 방어보다 BFF가 깔끔

---

## 5. 그래프 시각화 설계 (4개 + KPI)

### Q. 사용자 질문

> 현재 관리자 대시보드 그래프를 구현하려고 합니다. 나는 아직 초보자라 그래프 설계 경험이 부족하여, 각 지표에 대해 가장 적절한 시각화 방식까지 포함해서 제안을 받고 싶습니다.
>
> 보여주고 싶은 정보 (목표):
> 1. 시간에 따른 주문/결제 흐름
> 2. 사용자 행동 흐름 (주문 → 결제)
> 3. 매출 분포 (카테고리별)
> 4. 전체적인 서비스 상태를 한눈에 볼 수 있는 지표
>
> 각 항목에 대해 가장 적절한 그래프 타입 선택 (이유 포함), 대안 그래프, 필요한 데이터 구조 (API 응답 형태), ECharts에서의 구성 방식, 대시보드 UX 관점에서의 추천 구성 (배치, 우선순위 등)을 제안해달라.

### A. 차트 매핑

| 목표 | 차트 | 데이터 소스 |
|------|------|-----------|
| 시간에 따른 주문/결제 흐름 | 꺾은선 (Line) | audit_logs |
| 사용자 행동 흐름 (주문→결제) | 펀넬 (Funnel) | orders 테이블 |
| 매출 분포 (카테고리별) | 트리맵 (Treemap) | orders + order_items + categories |
| 전체 서비스 상태 | KPI 카드 + 보안 막대 (Bar) | audit_logs |

### 차트 1 — 꺾은선 (일별 주문/결제 현황)

**왜 꺾은선인가?**
- 추세를 즉각 읽을 수 있음 (선의 기울기)
- 여러 지표 겹쳐 비교 가능 (ORDER_CREATED, PAYMENT_VERIFIED, ORDER_CANCELLED)
- 이전 기간 점선 오버레이 자연스러움

**대안**: 스택 에어리어 차트 (추세 + 총 볼륨 동시)

**API 응답 구조**:
```ts
interface OrderTrendResponse {
  current: {
    date: string;
    ordered: number;
    paid: number;
    cancelled: number;
  }[];
  previous: { /* 비교 기간 */ }[];
}
```

**SQL 핵심**:
```sql
SELECT
  DATE(created_at AT TIME ZONE 'Asia/Seoul') AS date,
  SUM(CASE WHEN action = 'ORDER_CREATED'    THEN 1 ELSE 0 END) AS ordered,
  SUM(CASE WHEN action = 'PAYMENT_VERIFIED' THEN 1 ELSE 0 END) AS paid,
  SUM(CASE WHEN action = 'ORDER_CANCELLED'  THEN 1 ELSE 0 END) AS cancelled
FROM audit_logs
WHERE created_at BETWEEN :start AND :end
GROUP BY date
ORDER BY date ASC
```

### 차트 2 — 막대 + 선 (보안 현황)

**왜 단순 막대가 아닌가?**
- LOGIN(300~500/일) vs FAILED_LOGIN(10~30/일) vs ACCOUNT_LOCKED(0~5/일) 스케일 차이로 작은 막대가 안 보임
- 의미 있는 지표는 절대 건수보다 "실패 비율"

**구성**:
- 왼쪽 Y축 (Bar): FAILED_LOGIN, ACCOUNT_LOCKED 건수
- 오른쪽 Y축 (Line): 로그인 실패율 (failedLogin / total × 100)
- markLine: 10% 경고 기준선

**대안**: FAILED_LOGIN/ACCOUNT_LOCKED 두 막대만 (실패율 없이) — 단순한 초기 버전

### 차트 3 — 펀넬 (결제 전환, 코호트 기반)

**왜 펀넬인가?**
- 단계별 이탈을 직관적으로 표현
- 위가 넓고 아래로 갈수록 좁아지는 구조 = 이탈 발생을 시각적으로 표현

**핵심 트릭**: PostgreSQL `COUNT(column)`은 NULL 제외 카운트
```sql
SELECT
  COUNT(*)            AS created,
  COUNT(paid_at)      AS paid,
  COUNT(shipped_at)   AS shipped,
  COUNT(delivered_at) AS delivered,
  COUNT(completed_at) AS completed
FROM orders
WHERE created_at BETWEEN :start AND :end
```

orders 테이블 한 번 쿼리로 5단계 모두 집계 가능.

**API 응답 구조**:
```ts
interface FunnelResponse {
  period: { start: string; end: string };
  stages: {
    name: string;
    count: number;
    rate: number;     // 최초 단계 대비 %
    dropRate: number; // 직전 단계 대비 이탈률
  }[];
  cancelledCount: number;
}
```

### 차트 4 — 트리맵 (카테고리별 매출)

**왜 트리맵인가?**
- 박스 크기(매출 비중) + 색상(증감률) → 두 차원 동시 표현
- 멀티 셀러 오픈마켓 핵심 지표 (셀러 모집 전략, 카테고리 트렌드 변화)
- 카테고리 6개 이상이면 파이 차트보다 가독성 우월

**색상 인코딩**:
- 진한 초록 (>10% 성장) — 셀러 모집 강화 신호
- 연한 초록 (0~10% 성장)
- 노랑 (-10~0%)
- 빨강 (<-10% 감소) — 무슨 일이?

### KPI 카드 (전체 서비스 상태)

차트보다 숫자 카드가 효과적. 4개 카드:
- 오늘 주문 수 / 전일 대비
- 오늘 매출액 / 전일 대비
- 미처리 배송 건수
- 로그인 실패율

### 대시보드 배치

```
┌────────────────────────────────────────────────────┐
│  KPI 카드 4개 (가로)                                │
├────────────────────────────────────────────────────┤
│  일별 주문/결제 (꺾은선) — 전체 너비                 │
├────────────────────────┬───────────────────────────┤
│  결제 전환 펀넬          │  카테고리별 매출 트리맵    │
├────────────────────────────────────────────────────┤
│  로그인 보안 (막대)                                  │
└────────────────────────────────────────────────────┘
```

### 구현 순서

1. KPI 카드 (가장 단순, 빠른 성과)
2. 꺾은선 (ECharts 기본 감)
3. 보안 막대 (이중 Y축)
4. 펀넬 (Funnel 타입)
5. 트리맵 (색상 인코딩)

---

## 6. API/DB/프론트 데이터 흐름 + 성능 고려사항

### Q. 사용자 질문

> 1. 현재 설계와 요구사항 기준으로:
>    * 필요한 API 설계 (엔드포인트, 응답 형태)
>    * DB 조회 방식 (쿼리 또는 로직)
>    * 프론트 데이터 흐름
> 2. 각 그래프별로:
>    * 어떤 데이터 구조로 내려주면 좋은지
>    * ECharts에서 어떻게 매핑하면 좋은지
> 3. 추가적으로:
>    * 성능/확장성 고려사항
>    * 지금 설계에서 놓친 부분이 있다면 지적

### A. 답변 요약

#### API 설계 — 분리 엔드포인트

```
GET /v1/admin/dashboard/kpi
GET /v1/admin/dashboard/order-trend?startDate=&endDate=&compareWithPrevious=true
GET /v1/admin/dashboard/security?startDate=&endDate=
GET /v1/admin/dashboard/funnel?startDate=&endDate=
GET /v1/admin/dashboard/category-revenue?startDate=&endDate=
```

분리 이유:
1. 그래프별 캐싱 TTL 다름
2. 하나가 느려도 다른 차트는 보임
3. 에러 격리
4. React Query queryKey 독립 관리

#### 모듈 구조

```
backend/src/admin/
  admin.module.ts
  dashboard/
    dashboard.controller.ts
    dashboard.service.ts
    dto/
      date-range-query.dto.ts
      kpi-response.dto.ts
      order-trend-response.dto.ts
      security-response.dto.ts
      funnel-response.dto.ts
      category-revenue-response.dto.ts
```

#### DB 조회 핵심 원칙

**TypeORM `find()` 대신 QueryBuilder 사용** (집계 쿼리에는 부적합)

**중요한 두 가지**:
- `AT TIME ZONE 'Asia/Seoul'` 명시 (UTC 그대로 GROUP BY하면 9시간 어긋남)
- 빈 날짜 채우기 (`fillEmptyDates` 헬퍼) — SQL은 데이터 있는 날짜만 반환

**인덱스 추가 필요**:
- audit_logs: `[action, createdAt]` 이미 있음 ✓
- orders: `[createdAt]`, `[status, createdAt]` 추가 필요

#### 프론트 데이터 흐름

**상태 진실 원천 = URL 쿼리 파라미터**

```
/admin/dashboard?startDate=2026-04-01&endDate=2026-04-27
```

이유: 새로고침 유지 / 공유 가능 / 뒤로 가기 작동 / React Query 캐싱과 궁합

```
사용자가 기간 변경
  → DashboardFilters가 router.push로 URL 업데이트
  → 모든 차트의 useSearchParams 값 변경
  → React Query queryKey 변경 → 자동 refetch
  → 새 데이터로 차트 재렌더
```

**컴포넌트 구조**:
```
app/(admin)/admin/dashboard/
  page.tsx                       ← Server Component
  components/
    DashboardFilters.tsx         ← Client (URL 조작)
    KpiCards.tsx                 ← Client (/kpi)
    OrderTrendChart.tsx          ← Client (/order-trend)
    SecurityChart.tsx            ← Client (/security)
    FunnelChart.tsx              ← Client (/funnel)
    CategoryRevenueChart.tsx     ← Client (/category-revenue)
```

**ECharts 매핑 헬퍼는 별도 함수로 분리**:
```ts
// lib/charts/order-trend.ts
export function buildOrderTrendOption(data: OrderTrendResponse): EChartsOption {
  // 순수 함수, 테스트 가능
}
```

#### 성능/확장성

**Redis 캐싱 TTL**:

| 엔드포인트 | TTL |
|-----------|-----|
| `/kpi` | 60초 |
| `/order-trend` | 5분 |
| `/security` | 5분 |
| `/funnel` | 10분 |
| `/category-revenue` | 30분 |

**기간 제한**: max 90일 (DTO에 validator 추가)

#### 놓친 부분 (보완 필요)

1. **시간대 처리**: 모든 집계 쿼리에 `AT TIME ZONE 'Asia/Seoul'` 명시
2. **CSV 내보내기 엔드포인트 분리**: `/v1/admin/dashboard/order-trend.csv` 별도
3. **드릴다운 라우팅 규칙 통일**: 차트 클릭 → `/admin/audit-logs?action=...&startDate=...` 형식
4. **데이터 갱신 시점 표시**: React Query `dataUpdatedAt` + 5초마다 텍스트 갱신 훅
5. **인증 가드 3중 방어 명시화**: middleware → layout server component → backend RolesGuard
6. **DTO 검증**: `@IsISO8601()`, `startDate ≤ endDate`, 기간 ≤ 90일

---

## 7. 다음 컨텍스트로 넘기는 종합 컨텍스트

다음 섹션의 프롬프트(아래 별도 출력)를 다음 컨텍스트 시작 시 그대로 전달하면 된다.
