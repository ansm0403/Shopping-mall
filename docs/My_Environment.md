# My_Environment.md — 프로젝트 개발/배포 환경 설명서

> 목적: 다른 LLM이나 협업자에게 매번 환경을 다시 설명하지 않기 위해 만든 단일 참조 문서.
> 작성 기준일: 2026-04-27
> 본 문서는 `README.md`(백엔드 위주)를 보완해 **로컬 개발 + 배포(Vercel/EC2) + Docker** 전체를 다룬다.

---

## 0. TL;DR — 한 문단 요약

- **모노레포**: Nx + Yarn 4 workspace. `backend/`(NestJS), `frontend/`(Next.js 15), `shared/` 패키지로 구성.
- **백엔드**: NestJS 11 + TypeORM + PostgreSQL + Redis + JWT(Access/Refresh). API prefix는 **`/v1`**, 포트 **4000**.
- **프론트엔드**: Next.js 15(App Router) + React 19 + TanStack Query + Tailwind 3, 포트 **3000**.
- **로컬 인프라**: `docker-compose.local.yaml`로 PostgreSQL + Redis만 띄우고, 백엔드는 호스트에서 `nx serve backend` 직접 실행.
- **배포**: Frontend → **Vercel**, Backend → **AWS EC2 t3.small** (Docker Hub `ansmoon/shopping-mall-backend:latest` pull 후 `docker-compose -f docker-compose.prod.yaml up`).
- **트래픽 경로(현재)**: 브라우저 → Vercel `/api/*` → (Next.js rewrites) → EC2 `:4000/v1/*`. EC2에 **nginx/HTTPS가 아직 없어** Vercel 서버사이드 프록시로 이를 대신하고 있다. 브라우저는 EC2를 직접 모르므로 **운영 환경에서는 CORS가 사실상 발생하지 않는다.** (자세한 내용은 5-5 섹션)
- **로컬은 직통**: 로컬 프론트는 `NEXT_PUBLIC_API_URL=http://localhost:4000/v1`로 EC2 프록시를 거치지 않고 백엔드를 직접 호출 → 그래서 **로컬에서는 CORS가 살아있고, 백엔드 `FRONTEND_URL`이 잘못 잡히면 즉시 막힌다(현 발생 중인 문제)**.
- **DB 영속성**: EC2의 추가 EBS(`/mnt/postgres-data`)에 PostgreSQL 데이터를 마운트해 인스턴스를 종료/재생성해도 데이터는 보존.
- **t3.small 제약**: EC2 내부 빌드 시 메모리 부족. 그래서 **로컬 빌드 → Docker 이미지 → Docker Hub push → EC2 pull**의 수동 파이프라인 사용. CI/CD 없음.

---

## 1. 모노레포 구조 (Nx Workspace)

```
shopping_mall/
├── backend/                  # NestJS 백엔드 (포트 4000)
│   ├── src/
│   │   ├── auth/             # JWT 인증, 세션, 이메일 인증
│   │   ├── user/             # 유저, Role(BUYER/SELLER/ADMIN)
│   │   ├── product/          # 상품 CRUD + 승인
│   │   ├── category/         # 계층형 카테고리 + JSONB 스펙
│   │   ├── cart/ order/ payment/  # 결제(PortOne V2)
│   │   ├── seller/ settlement/    # 정산
│   │   ├── review/ inquiry/ wish-list/
│   │   ├── audit/            # 감사 로그(@Auditable 데코레이터 + Interceptor)
│   │   ├── admin/            # ★신규 — 관리자 대시보드 (KPI 등)
│   │   │   └── dashboard/
│   │   ├── common/           # 공통 가드/인터셉터/시드
│   │   ├── data/             # 시드 데이터 (beauty/book/clothing/food/living/shoes)
│   │   └── intrastructure/   # 이메일, Redis (오타지만 그대로 유지됨)
│   ├── .env                  # 로컬 비밀 (커밋 안 함)
│   └── .env.example
├── frontend/                 # Next.js 15 (포트 3000)
│   └── src/
│       ├── app/
│       │   ├── (auth)/       # 로그인/회원가입/이메일 인증
│       │   ├── (main)/       # 일반 사용자 화면 (상품/장바구니/주문/마이페이지/판매자)
│       │   ├── (admin)/      # ★신규 — 관리자 화면 (route group, layout에서 SSR로 ADMIN 검증)
│       │   └── api/          # Next.js Route Handlers (auth 프록시: login/refresh/logout)
│       ├── service/          # axios 호출 함수 (auth, product, cart, order, admin-dashboard 등)
│       ├── hooks/ hook/      # ※ 두 폴더 공존 — TanStack Query 훅 모음
│       ├── lib/axios/        # axios-http-client (publicClient/authClient + 401 retry + refresh race-condition 가드)
│       ├── contexts/         # AuthContext
│       ├── providers/        # ReactQueryProvider
│       └── middleware.ts     # /admin/** 진입 시 refreshToken 쿠키 검사 → 없으면 /login 리다이렉트
├── shared/                   # 두 앱이 공유하는 패키지 (transpilePackages로 frontend가 소스 직접 사용)
├── mocks/                    # Mock 데이터
├── Dockerfile                # 멀티스테이지 (deps → builder → prod) backend-only
├── docker-compose.yaml       # 빌드 포함 (개발/디버깅용 로컬 통합)
├── docker-compose.local.yaml # ★로컬 개발용 — Postgres + Redis만 띄움
├── docker-compose.prod.yaml  # ★EC2용 — Docker Hub 이미지 pull
├── nx.json / package.json    # Nx 21.6.3, Yarn 4.10.3 (corepack)
└── docs/
    ├── Modify-proxy.md
    ├── deploy-issues.md
    ├── Design_Dashboard*.md
    └── My_Environment.md     # ← 이 문서
```

### 스택 핵심 버전

- Node.js: **20-slim** (Dockerfile에서 고정)
- 패키지 매니저: **Yarn 4.10.3** (corepack로 활성화, `package.json`의 `packageManager`가 진실의 원천)
- 빌드: **Nx 21.6.3** + Webpack 5 (백엔드 빌드 시 `nx sync` 후 `nx build backend --prod`)
- NestJS 11, TypeORM 0.3.27, ioredis, helmet 8, @nestjs/throttler
- Next.js 15.2.4, React 19, @tanstack/react-query 5.9x, axios 1.x, gsap, tailwindcss 3, zod 4

---

## 2. 로컬 개발 환경

### 2-1. 사전 준비

1. Node.js 20 LTS 설치
2. Docker Desktop 설치 (PostgreSQL/Redis 컨테이너용)
3. Corepack 활성화: `corepack enable && corepack prepare yarn@4.10.3 --activate`
4. 저장소 clone 후 의존성 설치: `yarn install`

### 2-2. 인프라 띄우기 (Postgres + Redis)

```bash
docker compose -f docker-compose.local.yaml up -d
```

`docker-compose.local.yaml`이 띄우는 것:
- `postgres` (postgres:18-alpine, 포트 5432, user/pw/db = `sangmoon` / `postgres` / `sangmoon`, UTF-8 + C locale)
- `redis` (redis:alpine, 포트 6379, AOF 영속화)
- 네트워크: `shopping-mall-local-network`
- 볼륨: `postgres_dev_data`, `redis_dev_data` (named volume)

> ⚠️ `docker-compose.yaml`(prefix 없음)은 **백엔드 Dockerfile 빌드까지 포함**하는 무거운 파일이다. 로컬에서 평소엔 절대 쓰지 말고 항상 `docker-compose.local.yaml`을 사용한다.

### 2-3. 백엔드 실행

```bash
# 워크스페이스 루트에서
yarn nx serve backend
# → http://localhost:4000/v1
```

- `nx serve backend`는 dev 빌드 + watch + node 실행을 동시 수행 (`backend/package.json`의 `serve` target 참조).
- 환경변수는 `backend/.env`에서 자동 로드 (`ConfigModule.forRoot({ envFilePath: '.env' })`).
- ConfigModule의 `validate()`가 **`FRONTEND_URL` 누락 시 부팅 자체가 실패**한다 — 잊지 말 것.
- `synchronize`는 `NODE_ENV !== 'production'`일 때만 true. 로컬에서는 엔티티 변경이 자동으로 DB에 반영됨(개발 편의 & 데이터 손실 위험).

### 2-4. 프론트엔드 실행

```bash
yarn nx serve frontend
# → http://localhost:3000
```

- 프론트는 `frontend/.env`의 `NEXT_PUBLIC_API_URL='http://localhost:4000/v1'`을 axios `baseURL`로 사용.
- 즉, 로컬은 **Vercel 프록시를 거치지 않고 브라우저가 EC2(=localhost) 백엔드를 직접 호출**한다. 따라서 백엔드 CORS 설정이 살아있어야 한다 (4번 섹션 참조).

### 2-5. 자주 쓰는 Nx 명령

```bash
yarn nx serve backend           # 백엔드 dev + watch
yarn nx serve frontend          # 프론트 dev + Hot Reload
yarn nx build backend --prod    # 프로덕션 번들 빌드 (backend/dist/main.js)
yarn nx test backend            # Jest
yarn nx lint backend
yarn nx run-many -t lint test
yarn nx affected -t build       # 변경된 프로젝트만 빌드
yarn nx reset                   # Nx 캐시/데몬 초기화 (빌드 이상 시)
yarn nx sync                    # tsconfig project references 동기화
```

---

## 3. 환경 변수

### 3-1. `backend/.env` (커밋 금지)

| 키 | 로컬 권장값 | 운영(EC2) 값 | 설명 |
|---|---|---|---|
| `PROTOCOL` | `http` | `http` | 현재 미사용에 가까운 메타값 |
| `HOST` | `localhost:4000` | (사용 안 함) | 메타값 |
| `PORT` | `4000` | `4000` | NestJS listen 포트 |
| `POSTGRES_HOST` | `localhost` | `postgres` (compose가 오버라이드) | DB 호스트 |
| `POSTGRES_PORT` | `5432` | `5432` | |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | 자유(예: sangmoon/postgres/sangmoon) | 운영 비밀값 | |
| `REDIS_HOST` | `localhost` | `redis` (compose가 오버라이드) | |
| `REDIS_PORT` | `6379` | `6379` | |
| `REDIS_PASSWORD` | (빈값) | (운영도 비번 미설정 — 컨테이너 내부에서만 노출) | |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | 자유 | 운영 비밀값 | 대칭키, 운영 키는 절대 커밋/공유 금지 |
| `MAIL_HOST` / `MAIL_PORT` / `MAIL_USER` / `MAIL_PASSWORD` | 네이버 SMTP 사용 (smtp.naver.com:587) | 동일 | 이메일 인증 발송 |
| `MAIL_FROM_NAME` / `MAIL_FROM_ADDRESS` | `Shopping Mall` / `kirianir@naver.com` | 동일 | |
| **`FRONTEND_URL`** | **`http://localhost:3000`** | `https://shopping-mall-frontend-dusky.vercel.app` | ★ 두 가지 용도: ① 이메일 링크 생성 ② **백엔드 CORS allow-origin** |
| `PORTONE_API_SECRET` | 포트원 콘솔 V2 시크릿 | 동일 (운영 키 별도 발급 권장) | PortOne V2 결제 검증 |

> ⚠️ **현재 로컬 `.env`의 `FRONTEND_URL`이 운영 Vercel URL로 잡혀있다 → 4번 섹션 CORS 문제의 직접 원인.**

### 3-2. `frontend/.env` (Next.js)

| 키 | 로컬 | 운영(Vercel 환경변수) |
|---|---|---|
| `PORT` | `3000` | (Vercel 자동) |
| `NEXT_PUBLIC_API_URL` | `'http://localhost:4000/v1'` | `'/api'` (Vercel rewrites가 EC2로 프록시) |
| `NEXT_PUBLIC_PORTONE_STORE_ID` | 포트원 store id | 동일 |
| `NEXT_PUBLIC_PORTONE_CHANNEL_KEY` | 포트원 channel key | 동일 |
| `API_PROXY_TARGET` | (없음, 로컬은 프록시 안 씀) | `http://<EC2-IP>:4000/v1` (Vercel 서버사이드 환경변수) |

`NEXT_PUBLIC_*`은 **클라이언트 번들에 그대로 박힘** → 비밀이 아니어야 한다. 비밀은 `API_PROXY_TARGET`처럼 prefix 없는 변수로 둬서 서버사이드(Route Handlers, `next.config.js` rewrites)에서만 접근.

### 3-3. 로컬 vs 운영 흐름 차이 한 줄 요약

- **로컬**: 브라우저(:3000) → 직접 → 백엔드(:4000) — CORS 필요
- **운영**: 브라우저 → Vercel(:443) `/api/*` rewrites → EC2(:4000) `/v1/*` — CORS 사실상 불필요(백엔드는 항상 same-origin인 Vercel만 응답)

---

## 4. 현재 발생한 CORS 에러 — 원인과 해결

### 4-1. 에러 원문

```
Access to XMLHttpRequest at 'http://localhost:4000/v1/categories'
from origin 'http://localhost:3000'
has been blocked by CORS policy:
The 'Access-Control-Allow-Origin' header has a value
'https://shopping-mall-frontend-dusky.vercel.app'
that is not equal to the supplied origin.
```

### 4-2. 원인 분석

`backend/src/main.ts:41-46`의 CORS 설정은 **단일 origin만 허용**한다:

```ts
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  ...
});
```

그리고 현재 `backend/.env`에는

```
FRONTEND_URL=https://shopping-mall-frontend-dusky.vercel.app
```

가 들어있다. 즉:

1. 백엔드를 로컬에서 띄울 때도 `FRONTEND_URL`이 운영 Vercel URL로 평가된다.
2. 백엔드는 모든 응답에 `Access-Control-Allow-Origin: https://shopping-mall-frontend-dusky.vercel.app`을 박는다.
3. 로컬 프론트는 `http://localhost:3000`에서 요청 → 브라우저가 origin 불일치를 감지 → CORS 차단.

> "원래는 발생하지 않았던 문제"인 이유: 이전에는 `FRONTEND_URL=http://localhost:3000`이었거나, 프록시 방식으로만 운영하던 시점에는 운영 환경에서 CORS가 굳이 필요 없어 무시 가능했다. 최근(2026-04-24) `Modify-proxy.md` 변경 이후 `.env`의 `FRONTEND_URL`을 Vercel URL로 바꾸면서 **로컬에서만** CORS가 깨졌다.

**왜 운영에선 CORS 설정이 사실상 의미 없는가?** (이게 핵심 맥락)

현재 EC2에는 **nginx + HTTPS가 미설치** 상태다 (시간 제약). 이를 만회하기 위해 `next.config.js`의 `rewrites()`로 Vercel 서버가 EC2를 대신 호출하는 프록시 방식을 사용 중이다.

```
운영 환경 요청 흐름:
브라우저 → Vercel (HTTPS, same-origin) → rewrites → EC2:4000 (HTTP, 서버-to-서버)
```

이 구조에서 **브라우저는 Vercel 도메인에만 요청**을 보낸다. 즉:
- 브라우저 입장에서 `/api/*`는 same-origin 요청 → 브라우저가 CORS 검사 자체를 하지 않는다.
- Vercel → EC2 구간은 서버사이드 fetch → CORS는 브라우저 보안 정책이므로 서버간 호출에는 적용되지 않는다.
- 결과적으로 **백엔드의 `enableCors` 설정은 운영에서 실질적으로 무의미**하다.

따라서 운영 `.env`의 `FRONTEND_URL`이 Vercel URL로 잡혀있어도 운영 환경에서는 아무 문제가 없다. 문제는 오직 **로컬** — 직통 호출이라 CORS가 살아있고, 로컬 `.env`에도 운영 URL이 들어있어 막힌다.

`FRONTEND_URL`은 **이메일 인증 링크 생성**에도 쓰인다(`backend/src/intrastructure/emailVerify/email.service.ts`). 그래서 단순히 로컬에서 매번 값을 바꾸는 건 좋은 해결책이 아니다 — 이메일 링크 도메인까지 같이 흔들린다. **이메일 링크용**과 **CORS 화이트리스트용**을 분리해야 한다.

### 4-3. 해결 방법 (권장도 순)

#### ✅ 방법 A — 백엔드를 멀티 origin 허용으로 수정 (권장, 한 번에 해결)

`FRONTEND_URL`은 이메일 링크 전용으로 두고, **CORS 전용 환경변수 `CORS_ORIGINS`를 새로 도입**한다.

`backend/src/main.ts` 수정안:

```ts
// CORS 허용 origin 목록 — 콤마 구분
const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.enableCors({
  origin: (origin, cb) => {
    // origin이 없는 요청(서버사이드 fetch, curl, same-origin)은 통과
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-device-id', 'x-idempotency-key'],
});
```

`.env` 변경:

```dotenv
# 로컬
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000

# 운영 (EC2 .env)
FRONTEND_URL=https://shopping-mall-frontend-dusky.vercel.app
CORS_ORIGINS=https://shopping-mall-frontend-dusky.vercel.app
# ↑ 운영에서는 사실상 same-origin이라 CORS가 거의 안 쓰이지만 안전을 위해 명시
```

장점: 로컬 .env를 수정하지 않아도 됨, 운영에서 다중 도메인(예: 커스텀 도메인 추가) 시에도 그대로 확장 가능.

#### ✅ 방법 B — 로컬 .env에서 FRONTEND_URL만 로컬값으로 되돌리기 (최단 수정)

```dotenv
FRONTEND_URL=http://localhost:3000
```

로 다시 바꾸면 즉시 해결. 단점:
- 배포할 때 EC2에 올라가는 `.env`는 운영값(`https://shopping-mall-...vercel.app`)이어야 하므로 **로컬용 `.env`와 운영용 `.env`를 별도로 관리**해야 한다.
- 이메일 링크 외에 **운영에서 정말로 CORS가 필요한 케이스가 생기면(예: 외부 도메인에서 백엔드 직접 호출)** 다시 멀티 origin을 도입해야 한다.

#### ✅ 방법 C — 로컬에서도 Next.js rewrites 프록시를 통과시키기

`frontend/.env`의 `NEXT_PUBLIC_API_URL`을 `/api`로 바꾸고 `next.config.js`의 rewrites가 로컬에서도 `http://localhost:4000/v1`로 프록시하게 둔다 (이미 `process.env.API_PROXY_TARGET || 'http://localhost:4000/v1'`로 fallback 됨). 이러면 브라우저는 항상 same-origin이라 CORS 자체가 사라진다.

장점: 운영 동작과 로컬 동작이 동일해짐.
단점: 단순히 환경변수만 건드리면 끝이 아니라 실제 axios 호출 경로/콘솔 로그/디버깅 흐름이 한 단계 추가됨. 또 일부 코드가 직접 `http://localhost:4000`을 가정하고 있다면(CSP 등) 같이 정리 필요.

> **추천**: 방법 A를 적용하면 로컬/운영/추가 도메인 모두를 한 코드로 커버한다. 작업량은 main.ts 5줄 + 두 환경의 `.env`에 `CORS_ORIGINS` 한 줄 추가로 끝난다.

### 4-4. 적용 후 확인 절차

1. `backend/.env`에 `CORS_ORIGINS` 추가
2. `yarn nx serve backend` 재시작
3. 브라우저 DevTools → Network → `OPTIONS /v1/categories` 응답 헤더에 `Access-Control-Allow-Origin: http://localhost:3000`이 박히는지 확인
4. `Access-Control-Allow-Credentials: true` 함께 있는지 확인 (refreshToken 쿠키 전송에 필수)

---

## 5. Docker & 배포 구조

### 5-1. 세 개의 docker-compose 파일 역할

| 파일 | 용도 | DB 데이터 위치 | 백엔드 |
|---|---|---|---|
| `docker-compose.local.yaml` | **로컬 개발** Postgres+Redis만 | named volume `postgres_dev_data` | 호스트에서 `nx serve` |
| `docker-compose.yaml` | 통합 테스트(거의 안 씀) | named volume `postgres_data` | Dockerfile 빌드 |
| `docker-compose.prod.yaml` | **EC2 운영** | EBS 마운트 `/mnt/postgres-data` | Docker Hub 이미지 pull |

### 5-2. Dockerfile 멀티스테이지 (백엔드 전용)

`Dockerfile`은 5개 스테이지로 나뉘어 있고, **마지막 스테이지가 반드시 `backend-prod`** 여야 한다(주석에 명시). `--target` 없이 `docker build` 시 마지막 스테이지가 빌드되기 때문.

1. `base`: node:20-slim + python3/make/g++ + corepack로 yarn 4.10.3 활성화
2. `deps`: package.json/yarn.lock/.yarn/.yarnrc.yml만 복사 후 `yarn install`
3. `builder`: deps의 node_modules 복사 + 전체 소스 복사 → `nx reset` → `nx sync` → `NX_DAEMON=false yarn nx build backend --prod`
4. `prod-deps`: `yarn workspaces focus --production`로 프로덕션 의존성만
5. `backend-prod`: 최종 — non-root user(`nestjs:nodejs`) + curl(헬스체크용) + `/app/uploads` 디렉터리 권한 설정 + `CMD ["node", "backend/dist/main.js"]`. EXPOSE 4000.

> 프론트엔드는 Dockerfile에 없다. **Vercel이 자체 빌드**하기 때문.

### 5-3. 수동 배포 파이프라인 (CI/CD 없음)

```bash
# 1. 로컬에서 백엔드 이미지 빌드
docker build -t ansmoon/shopping-mall-backend:latest .

# 2. Docker Hub push
docker login
docker push ansmoon/shopping-mall-backend:latest

# 3. EC2 SSH 접속
ssh -i ~/.ssh/<key>.pem ubuntu@<EC2_IP>

# 4. EC2 안에서 — 보통 ~/shopping_mall/ 디렉터리에 .env와 docker-compose.prod.yaml만 둠
docker compose -f docker-compose.prod.yaml pull backend
docker compose -f docker-compose.prod.yaml up -d

# 5. 확인
docker compose -f docker-compose.prod.yaml ps
docker compose -f docker-compose.prod.yaml logs -f backend
curl http://localhost:4000/v1/health   # 헬스체크 (있다면)
```

> **t3.small에서 `docker build`를 직접 하지 말 것**. node_modules 설치 + nx 빌드 메모리 사용량이 2GB RAM을 넘는다. 로컬 빌드 → Hub 경유 pull이 강제 사항.

### 5-4. EC2 운영 환경 세부

- **인스턴스**: t3.small (2 vCPU, 2GB RAM) — Free Tier 크레딧으로 운영
- **OS**: Ubuntu (LTS 권장)
- **추가 EBS**: 별도 볼륨을 `/mnt`에 마운트. PostgreSQL 데이터를 `/mnt/postgres-data`에 둬서 EC2 인스턴스가 종료/재생성되어도 EBS만 새 인스턴스에 다시 attach하면 데이터 유지.
- **Docker Compose 마운트**:
  ```yaml
  volumes:
    - /mnt/postgres-data:/var/lib/postgresql
  ```
  (주의: `docker-compose.prod.yaml`은 `/var/lib/postgresql`로 마운트 — 로컬은 `/var/lib/postgresql/data`로 다른 깊이라 호환되지 않는다. 백업 복원 시 경로 차이 주의.)
- **보안 그룹 (현재 프록시 방식)**: 22(SSH 본인 IP only), 4000(0.0.0.0/0 — Vercel rewrites가 호출). 향후 nginx+HTTPS 전환 시 80/443 오픈 + 4000 차단.
- **비용 절감**: 사용하지 않을 땐 **Stop**(과금: EBS만 소액). **Terminate 금지** — Elastic IP/EBS 연결이 끊겨 복구 비용/리스크가 커짐.
- **Elastic IP**: 한 개 연결되어 있어 Stop/Start 후에도 IP 유지(예: `43.201.118.88`).

### 5-5. 현재 프록시 방식 — nginx/HTTPS 없이 보안 확보하기

**EC2에 nginx + Let's Encrypt HTTPS가 아직 설치되어 있지 않다.** 이유: 도메인 발급 + nginx 설정 + certbot 운영 등의 시간 비용이 현 단계에서 크다. 포트폴리오 기간 내에 전 기능 구현을 우선하고, HTTPS는 추후 전환 예정.

이를 만회하는 현재 방식: **Next.js `rewrites()`를 통한 Vercel 서버사이드 프록시**.

```
[현재 — 프록시 방식]
                         HTTPS ✓                  HTTP (평문, 인터넷 경유) ⚠
브라우저(사용자) ──────────────────── Vercel 서버 ─────────────────────── EC2:4000
    same-origin 요청(/api/*)         next.config.js rewrites              NestJS

[향후 — nginx+HTTPS 방식]
                         HTTPS ✓                         HTTPS ✓
브라우저(사용자) ──────────────────── EC2:443 (nginx) ─────────── EC2:4000 (컨테이너 내부)
    직접 API 도메인 호출               certbot Let's Encrypt              NestJS
```

| 항목 | 현재 (프록시) | 향후 (nginx+HTTPS) |
|---|---|---|
| 브라우저→서버 구간 | HTTPS (Vercel) ✓ | HTTPS (API 도메인) ✓ |
| Vercel/EC2 간 구간 | **HTTP 평문 ⚠** | HTTPS (전 구간 암호화) ✓ |
| EC2 보안 그룹 | :4000 외부 오픈 필요 | :443만 오픈, :4000 내부만 |
| CORS 중요도 | 낮음 (same-origin 프록시) | 높음 (브라우저가 직접 호출) |
| 쿠키 Secure 플래그 | true (Vercel은 HTTPS) | true |
| 구축 난이도 | 낮음 ✓ | 중간 (도메인 + Nginx + certbot) |

**현재 방식의 보안 제약**: Vercel → EC2 구간이 HTTP 평문이다. 이 구간에서 이론적으로 JWT accessToken 노출이 가능하다. 포트폴리오 수준에서는 허용 가능한 트레이드오프로 판단하고 있다. 실서비스라면 반드시 전환 필요.

전환 절차는 `docs/Modify-proxy.md` 참조. `next.config.js`에도 주석으로 nginx+HTTPS 방식의 코드가 보관되어 있어 주석 해제만으로 전환 가능.

---

## 6. 트래픽 / 인증 흐름

### 6-1. API 요청 흐름

```
[운영 환경 — 현재 활성]

브라우저
  │  fetch('/api/products')   ← axios baseURL = '/api'
  ▼
Vercel Edge (https://shopping-mall-frontend-dusky.vercel.app)
  │  next.config.js rewrites: /api/:path* → ${API_PROXY_TARGET}/:path*
  ▼
EC2 :4000 (HTTP, 평문)
  │  NestJS globalPrefix='/v1' → /v1/products
  ▼
PostgreSQL / Redis (compose 내부 네트워크)


[로컬 환경]

브라우저(:3000)
  │  fetch('http://localhost:4000/v1/products')   ← NEXT_PUBLIC_API_URL 직통
  ▼
NestJS(:4000) — CORS 검사 (이게 현재 막혀 있음)
```

### 6-2. 인증 흐름 (JWT + httpOnly Cookie)

1. 로그인: `POST /v1/auth/login` → 응답 body에 `accessToken`(짧음, localStorage/sessionStorage에 저장), 응답 헤더 `Set-Cookie: refreshToken=...; httpOnly; sameSite=lax; secure(prod)`.
2. 일반 요청: 프론트가 `Authorization: Bearer <accessToken>` 헤더 부착, axios `withCredentials: true`로 쿠키 자동 동봉.
3. 401 발생 → axios response interceptor가 `POST /v1/auth/refresh` 호출(쿠키만 보냄) → 새 accessToken 받아 원 요청 재시도. 동시 다발 401 시 `isRefreshing` 플래그 + 단일 promise로 race-condition 차단.
4. 로그아웃: `POST /v1/auth/logout` → 백엔드가 RefreshToken DB 무효화 + `clearCookie` (옵션을 set 시점과 정확히 일치시켜야 삭제됨).

> **로컬 dev에서는 `secure: false`** (NODE_ENV !== 'production'). 운영은 `secure: true` — Vercel은 HTTPS라 OK.

### 6-3. CSP

- **백엔드 Helmet**: `connectSrc: ['self', 'http://localhost:4000', 'https://api.iamport.kr']` 등. 운영에서는 직접 호출이 없어 로컬 fallback이지만, 잘 동작 중.
- **프론트 Next.js `headers()`**: `connect-src 'self' (+ localhost:4000 in dev) https://*.portone.io https://*.iamport.co`. 프록시 덕에 운영에서는 `'self'`만으로 충분.
- 향후 nginx+HTTPS 방식 전환 시 `connect-src`에 `https://api.yourdomain.com` 추가 필요. `next.config.js` 상단 주석에 절차 보관됨(`docs/Modify-proxy.md` 참고).

---

## 7. DB / Redis / 시드 데이터

### 7-1. PostgreSQL

- 18-alpine, UTF-8 + C locale (정렬은 바이너리 비교).
- TypeORM `autoLoadEntities: true` → 모듈에서 `forFeature` 등록한 엔티티가 자동 로드.
- **`synchronize`**: dev=true / prod=false. prod에서 스키마 변경 시 수동 SQL 또는 임시 synchronize=true 우회 (현재 마이그레이션 미도입). `docs/deploy-issues.md`의 시나리오 참고.
- 시드: `RolesSeedService`(BUYER/SELLER/ADMIN), `CategorySeedService`(계층 카테고리). 부팅 시 1회 idempotent 실행.
- `backend/src/data/raw/`에 카테고리별 raw 시드 데이터 존재 (현재 git 미추적 — 신규 추가).

### 7-2. Redis

- 세션/캐시용. ioredis 사용. `intrastructure/redis` 모듈에서 클라이언트 관리.
- 운영은 비밀번호 없음 — **컨테이너 외부 미노출**(`docker-compose.prod.yaml`이 ports를 publish 안 함)이 유일한 보호막. 향후 ACL/패스워드 도입 권장.

### 7-3. 데이터 영속성 보장

- 로컬: `postgres_dev_data` named volume → docker volume 자체가 사라지지 않는 한 유지.
- 운영: `/mnt/postgres-data` (EBS) → 인스턴스 종료해도 EBS만 살리면 DB 보존. **EBS 스냅샷을 주기적으로 떠둘 것**(현재 자동화 없음 — 수동 책임).

---

## 8. 자주 헷갈리는 포인트 (Gotchas)

1. **API 글로벌 프리픽스 `/v1`**. `axios baseURL`/Vercel rewrites destination/curl 모두 `/v1`을 포함해야 함. 단 `DashboardController`는 `@Controller('v1/admin/dashboard')`로 prefix를 또 적었는데, NestJS는 `setGlobalPrefix('v1')`와 합쳐 **최종 경로가 `/v1/v1/admin/dashboard`가 된다** — 의도된 게 아니라면 컨트롤러 경로를 `'admin/dashboard'`로 바꿔야 한다.
2. **`hooks/`와 `hook/` 폴더가 둘 다 존재**. 신규 코드는 `hooks/`로 통일 권장. `hook/`(단수)에는 `useAuthMutation.ts`, `useProduct.ts`만 남음.
3. **route group 변경**: `frontend/src/app/(main)/admin/...`에서 `frontend/src/app/(admin)/admin/...`로 옮겨졌다(git status 참조). middleware는 여전히 `/admin/:path*` 매처로 동작.
4. **Admin 검증 이중**: `middleware.ts`(Edge에서 refreshToken 쿠키 존재만 확인) + `app/(admin)/layout.tsx`(서버 컴포넌트에서 `/auth/refresh` → `/auth/me` → `roles`에 admin 포함 확인). 두 단계가 같이 통과해야 admin 진입.
5. **`PORTONE_API_SECRET`은 V2용**. 환경변수 이름이 `IMP_KEY/IMP_SECRET`이 아닌 점 주의. `README.md`의 예시는 옛 V1 기준이라 .env.example가 진실.
6. **`backend/postgres-data/`**(로컬 compose의 init script 디렉터리)에 init SQL을 두면 **최초 부팅 시에만** 실행됨 — 이미 데이터가 있으면 무시.
7. **MAIL 비밀번호가 `.env.example`에 평문 예시값**. 실제 `.env`엔 운영 비밀번호가 있으니 절대 커밋/공유 금지.
8. **EBS 마운트 경로 차이**: 로컬 compose는 `/var/lib/postgresql/data`, EC2 prod compose는 `/var/lib/postgresql` — 백업/복원 시 경로 깊이가 한 단계 다른 것을 인지할 것.

---

## 9. 향후 작업 시 체크리스트

새 기능을 만들 때 다음을 먼저 정해라.

- [ ] 이 기능은 **Public/User/Seller/Admin** 어느 권한? → `JwtAuthGuard` + `RolesGuard` + `@Roles(Role.X)` 조합
- [ ] DB 변경이 있는가? → 엔티티 수정만으로 로컬에선 동작하지만, **운영 배포 전에 마이그레이션 SQL 또는 수동 적용 계획**을 잡아라(`synchronize: false`).
- [ ] 감사 로그 대상인가? → `@Auditable(AuditAction.X)` 데코레이터 부착. action 타입은 enum에 추가.
- [ ] 결제/주문/정산 트랜잭션이 얽히는가? → `docs/`의 결제 동시성 이슈 회고 먼저 읽기.
- [ ] 프론트 컴포넌트가 인증 쿠키를 필요로 하는가? → `authClient` 사용(자동 401 재시도) + `withCredentials: true` 보장.
- [ ] 외부 도메인이 추가되는가? → 백엔드 Helmet `connectSrc`/`frameSrc`, Next.js `connect-src`, **CORS allow-list** 모두 동기화.
- [ ] 새로운 환경변수 추가했는가? → `backend/.env.example` 또는 `frontend/.env.example` 동시 갱신, 그리고 Vercel/EC2 양쪽에 등록.

---

## 10. 빠른 참조 표

| 항목 | 값 |
|---|---|
| 백엔드 베이스 URL (로컬) | `http://localhost:4000/v1` |
| 프론트 (로컬) | `http://localhost:3000` |
| 백엔드 (운영) | `http://<EC2-IP>:4000/v1` (브라우저 직접 호출 X) |
| 프론트 (운영) | `https://shopping-mall-frontend-dusky.vercel.app` |
| Docker Hub 이미지 | `ansmoon/shopping-mall-backend:latest` |
| EC2 인스턴스 타입 | `t3.small` (2 vCPU / 2 GB RAM) |
| Postgres 운영 데이터 위치 | EC2 EBS `/mnt/postgres-data` |
| 운영 배포 명령 | `docker compose -f docker-compose.prod.yaml pull && docker compose -f docker-compose.prod.yaml up -d` |
| Nx 캐시 리셋 | `yarn nx reset` |
| 패키지 매니저 | Yarn 4.10.3 (corepack) |
| Node | 20-slim |

---

## 11. 참고 문서

- `README.md` — 백엔드 기능/ERD/API 명세
- `docs/Modify-proxy.md` — Vercel 프록시 vs nginx+HTTPS 방식 전환 절차
- `docs/deploy-issues.md` — sameSite/synchronize 이슈 회고 (실무 시나리오)
- `docs/Design_Dashboard.md`, `Design_Dashboard_Handoff.md` — 관리자 대시보드 설계
- `backend/.env.example` / `frontend/.env*` — 환경변수 진실의 원천
