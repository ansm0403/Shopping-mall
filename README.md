
# E 커머스 쇼핑몰

<br>

---

## 프로젝트 소개

멀티 셀러 기반의 오픈마켓 쇼핑몰 백엔드 API 입니다.

구매자, 판매자, 관리자 세 가지 역할을 기반으로 상품 등록부터 주문, 결제(PortOne), 정산까지 이커머스의 전체 흐름을 구현하였으며, 감사 로그(Audit Log)를 통해 모든 주요 동작을 추적할 수 있도록 설계하였습니다.

> 프론트엔드는 현재 미구현 상태이며, 백엔드 API 위주로 개발하였습니다.

---

## 개발자 소개

<br>

* 안상문 : 백엔드

<br>

## 기술 스택

### Backend

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![TypeORM](https://img.shields.io/badge/TypeORM-FE0803.svg?style=for-the-badge&logo=typeorm&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens) <br>
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)

### Enviornment

![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)
![Visual Studio Code](https://img.shields.io/badge/Visual%20Studio%20Code-0078d7.svg?style=for-the-badge&logo=visual-studio-code&logoColor=white)

### Config

![Yarn](https://img.shields.io/badge/yarn-%232C8EBB.svg?style=for-the-badge&logo=yarn&logoColor=white)
![Nx](https://img.shields.io/badge/nx-143055?style=for-the-badge&logo=nx&logoColor=white)

<br>

---

## 아키텍처

```
shopping_mall/
├── backend/                # NestJS 백엔드 애플리케이션
│   └── src/
│       ├── auth/           # 인증 및 JWT (회원가입, 로그인, 세션 관리)
│       ├── user/           # 유저 관리
│       ├── product/        # 상품 CRUD & 승인 워크플로우
│       ├── category/       # 카테고리 계층 구조
│       ├── cart/           # 장바구니
│       ├── order/          # 주문 관리 & 배송 추적
│       ├── payment/        # 결제 (PortOne 연동)
│       ├── seller/         # 판매자 신청 및 관리
│       ├── settlement/     # 정산 시스템
│       ├── review/         # 리뷰 & 평점
│       ├── inquiry/        # 상품 문의 & 답변
│       ├── wish-list/      # 찜 목록
│       ├── audit/          # 감사 로그
│       ├── common/         # 공통 유틸, DTO, 인터셉터, 가드
│       └── intrastructure/ # 이메일 & Redis 서비스
├── frontend/               # Next.js 프론트엔드 (미구현)
├── shared/                 # 공유 라이브러리
└── docker-compose.yaml     # Docker 멀티 서비스 설정
```

<br>

---

## 주요 기능

### 1. 인증 및 인가

- JWT 기반 인증 (Access Token + Refresh Token)
- Refresh Token 은 httpOnly 쿠키로 관리 (XSS 방어)
- 이메일 인증 기반 회원가입
- 다중 디바이스 세션 관리 및 개별/전체 세션 해제
- 역할 기반 접근 제어 (BUYER, SELLER, ADMIN)

### 2. 상품 관리

- 판매자의 상품 CRUD
- 관리자의 상품 승인/반려 워크플로우 (PENDING → APPROVED / REJECTED)
- 계층형 카테고리 구조 (부모-자식)
- 카테고리별 스펙 (JSONB) - 뷰티, 도서, 의류, 식품, 리빙, 신발
- 태그 시스템, 다중 이미지 업로드, 재고 관리

### 3. 장바구니 & 주문

- 장바구니 상품 추가/수정/삭제
- 장바구니 기반 주문 생성
- 주문 상태 관리 (PENDING_PAYMENT → PAID → PREPARING → SHIPPED → DELIVERED → COMPLETED)
- 판매자별 개별 배송 추적 (운송장 번호, 택배사)
- 주문 취소 및 구매 확정

### 4. 결제 (PortOne 연동)

- PortOne(아임포트) 결제 검증 및 금액 위변조 탐지
- Webhook 을 통한 비동기 결제 상태 동기화
- 전체/부분 환불 처리
- 결제 영수증 URL 관리

### 5. 판매자 & 정산

- 구매자의 판매자 전환 신청 → 관리자 승인/반려
- 주문 완료 시 자동 정산 내역 생성
- 수수료 계산 (기본 10%)
- 정산 상태 관리 (PENDING → CONFIRMED → PAID)

### 6. 리뷰, 문의, 찜

- 주문 완료 후 리뷰 작성 (이미지 첨부, 1~5점 평점)
- 상품 문의 및 판매자 답변 (비밀 문의 지원)
- 찜 목록 토글 및 상품별 찜 수 집계

### 7. 관리자 기능

- 상품 승인/반려, 판매자 신청 관리
- 전체 주문 관리 및 배송 상태 변경
- 결제 강제 취소 권한
- 정산 확인 및 지급 처리
- 카테고리 관리 (생성, 수정, 삭제, 노출 여부)
- 감사 로그 조회

### 8. 보안 & 감사 로그

- 61개 이상의 감사 액션으로 모든 주요 동작 추적
- AuditInterceptor 를 통한 자동 로깅 (`@Auditable()` 데코레이터)
- IP 주소, User-Agent, 성공/실패 여부 기록
- Helmet 보안 헤더 및 CSP 적용
- Rate Limiting (Throttler)

<br>

---

## ERD

```
┌──────────┐     M:M     ┌──────────┐
│   User   │────────────▶│   Role   │
│          │             │(BUYER,   │
│          │             │ SELLER,  │
│          │             │ ADMIN)   │
└────┬─────┘             └──────────┘
     │
     ├── 1:1 ── Cart ── 1:M ── CartItem ── M:1 ── Product
     │
     ├── 1:1 ── Seller ── 1:M ── Product
     │                     1:M ── Settlement
     │                     1:M ── Shipment
     │
     ├── 1:M ── Order ── 1:M ── OrderItem ── M:1 ── Product
     │                    1:1 ── Payment          M:1 ── Seller
     │                    1:M ── Shipment
     │
     ├── 1:M ── Review ── M:1 ── Product
     │
     ├── 1:M ── Inquiry ── M:1 ── Product
     │                      M:1 ── Seller
     │
     ├── 1:M ── WishListItem ── M:1 ── Product
     │
     └── 1:M ── RefreshToken

Product ── M:1 ── Category (self-referential: parent-child)
        ── M:M ── Tag
        ── 1:M ── ProductImage
```

<br>

---

## API 명세 요약

### 인증 (`/v1/auth`)

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| POST | `/register` | 회원가입 | Public |
| POST | `/login` | 로그인 | Public |
| GET | `/me` | 내 정보 조회 | User |
| POST | `/refresh` | 토큰 갱신 | Public |
| POST | `/logout` | 로그아웃 | User |
| POST | `/logout-all` | 전체 세션 해제 | User |
| GET | `/sessions` | 세션 목록 조회 | User |
| DELETE | `/sessions/:tokenId` | 세션 해제 | User |
| GET | `/verify-email` | 이메일 인증 | Public |

### 상품 (`/v1/products`)

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| GET | `/` | 상품 목록 조회 | Public |
| GET | `/:id` | 상품 상세 조회 | Public |
| POST | `/` | 상품 등록 | Seller |
| PATCH | `/:id` | 상품 수정 | Seller |
| DELETE | `/:id` | 상품 삭제 | Seller |
| POST | `/:id/images` | 이미지 업로드 | Seller |

### 주문 (`/v1/orders`)

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| POST | `/` | 주문 생성 | Buyer |
| GET | `/` | 내 주문 목록 | Buyer |
| GET | `/:orderNumber` | 주문 상세 | Buyer |
| PATCH | `/:orderNumber/cancel` | 주문 취소 | Buyer |
| PATCH | `/:orderNumber/confirm` | 구매 확정 | Buyer |

### 결제 (`/v1/payments`)

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| POST | `/verify` | 결제 검증 | Buyer |
| POST | `/:orderNumber/cancel` | 결제 취소 | Buyer |
| POST | `/webhook` | PortOne 웹훅 | Public |

### 판매자 (`/v1/seller`)

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| POST | `/apply` | 판매자 신청 | Buyer |
| GET | `/me` | 신청 상태 조회 | Seller |
| GET | `/orders` | 판매자 주문 조회 | Seller |
| PATCH | `/orders/:orderNumber/ship` | 배송 처리 | Seller |
| GET | `/settlements` | 정산 내역 조회 | Seller |
| GET | `/settlements/summary` | 정산 요약 | Seller |

### 관리자 (`/v1/admin`)

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| PATCH | `/products/:id/approve` | 상품 승인 | Admin |
| PATCH | `/products/:id/reject` | 상품 반려 | Admin |
| PATCH | `/seller/applications/:id/approve` | 판매자 승인 | Admin |
| PATCH | `/orders/:orderNumber/deliver` | 배송 완료 처리 | Admin |
| PATCH | `/settlements/:id/confirm` | 정산 확인 | Admin |
| PATCH | `/settlements/:id/pay` | 정산 지급 | Admin |
| GET | `/audit-logs` | 감사 로그 조회 | Admin |

> 이외에도 장바구니, 리뷰, 문의, 찜, 카테고리 등의 API 가 구현되어 있습니다.

<br>

---

## 실행 방법

### 1. 환경 변수 설정

```bash
# backend/.env
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_DB=your_db
PORTONE_IMP_KEY=your_imp_key
PORTONE_IMP_SECRET=your_imp_secret
```

### 2. Docker 로 인프라 실행

```bash
docker-compose up -d    # PostgreSQL, Redis 실행
```

### 3. 의존성 설치 및 서버 실행

```bash
yarn install
npx nx serve backend    # http://localhost:4000
```

<br>

---

## 개선점

#### 결제 완료와 주문 취소의 동시 발생 문제 해결
1. 결제 완료(Webhook)와 주문 취소가 동시에 발생하면 결제 상태가 불일치하는 **유령 결제** 문제가 있었습니다.
2. `verifyPayment` 과정에서 PortOne API 와의 동시 호출 문제도 존재했습니다.
3. 트랜잭션 격리 수준과 상태 체크 순서를 조정하여, 결제 검증 시 주문 상태를 먼저 확인하고 처리하도록 개선하였습니다.

#### 감사 로그 시스템 설계
1. 이커머스 특성상 결제, 주문, 환불 등 민감한 동작이 많아 추적이 필요했습니다.
2. NestJS 의 Interceptor 와 커스텀 데코레이터(`@Auditable()`)를 활용하여, 비즈니스 로직을 건드리지 않고도 자동으로 로깅되는 구조를 설계했습니다.
3. 61개 이상의 액션 타입을 정의하여 인증, 주문, 결제, 상품, 정산 등 모든 영역을 커버합니다.

#### 멀티 셀러 배송 분리
1. 하나의 주문에 여러 판매자의 상품이 포함될 수 있어, 주문(Order) 단위가 아닌 판매자(Seller) 단위로 배송(Shipment)을 분리했습니다.
2. 이를 통해 각 판매자가 독립적으로 배송 처리를 할 수 있도록 구현하였습니다.

<br>

---

## 후기

실제 이커머스 서비스의 복잡한 비즈니스 로직을 직접 설계하고 구현하면서 많은 것을 배울 수 있었습니다.

특히 결제 연동 과정에서 PortOne 웹훅과 클라이언트 검증이 동시에 일어날 때의 동시성 문제, 그리고 주문-결제-정산으로 이어지는 트랜잭션 흐름을 관리하는 것이 가장 도전적이었습니다.

단순한 CRUD 를 넘어 역할 기반 접근 제어, 감사 로그, 정산 시스템 등 실무에서 필요한 기능들을 직접 구현해봄으로써, 백엔드 개발자로서의 역량을 한 단계 끌어올릴 수 있었습니다.

아쉬운 점이 있다면, 프론트엔드까지 완성하지 못하여 실제 사용자 흐름을 보여주지 못한 것과, 테스트 코드를 더 촘촘하게 작성하지 못한 부분입니다. 이 부분은 추후 개선할 예정입니다.
