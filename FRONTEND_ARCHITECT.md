프론트엔드 UI/라우팅 설계안
1. 역할별 페이지 맵
백엔드는 3가지 역할(BUYER, SELLER, ADMIN)을 기반으로 동작합니다. 이에 맞춰 라우트를 분리합니다.

역할	라우트 프리픽스	설명
Public (비로그인)	/	홈, 상품 목록/상세, 로그인/회원가입
Buyer (구매자)	/my/*	마이페이지, 장바구니, 주문, 위시리스트, 리뷰, 문의
Seller (판매자)	/seller/*	상품 관리, 주문 관리, 문의 응답, 정산
Admin (관리자)	/admin/*	상품 승인, 주문 관리, 판매자 관리, 정산, 감사 로그

2. Next.js App Router 폴더 구조

frontend/src/app/
├── layout.tsx                          # RootLayout (Emotion Registry, QueryProvider)
├── page.tsx                            # 홈 (상품 목록, 카테고리 네비게이션)
├── (auth)/
│   ├── login/page.tsx                  # 로그인
│   ├── register/page.tsx               # 회원가입
│   └── verify-email/page.tsx           # 이메일 인증 결과
│
├── products/
│   ├── page.tsx                        # 상품 목록 (카테고리 필터, 페이지네이션)
│   └── [id]/page.tsx                   # 상품 상세 (리뷰 탭, 문의 탭)
│
├── my/
│   ├── layout.tsx                      # 마이페이지 사이드바 레이아웃
│   ├── page.tsx                        # 프로필 조회/수정
│   ├── password/page.tsx               # 비밀번호 변경
│   ├── cart/page.tsx                    # 장바구니
│   ├── orders/
│   │   ├── page.tsx                    # 주문 내역
│   │   └── [orderNumber]/page.tsx      # 주문 상세 (결제, 배송, 취소, 구매확정)
│   ├── wishlist/page.tsx               # 위시리스트
│   ├── reviews/page.tsx                # 내 리뷰 관리
│   ├── inquiries/page.tsx              # 내 문의 관리
│   └── seller-apply/page.tsx           # 판매자 신청
│
├── checkout/
│   └── page.tsx                        # 주문서 작성 (배송지 입력 → 결제)
│
├── seller/
│   ├── layout.tsx                      # 셀러 대시보드 사이드바
│   ├── page.tsx                        # 셀러 대시보드 (요약)
│   ├── products/
│   │   ├── page.tsx                    # 내 상품 목록
│   │   └── new/page.tsx                # 상품 등록
│   ├── orders/page.tsx                 # 주문 관리 (배송 처리)
│   ├── inquiries/page.tsx              # 문의 답변
│   └── settlements/page.tsx            # 정산 내역/요약
│
├── admin/
│   ├── layout.tsx                      # 어드민 사이드바
│   ├── page.tsx                        # 어드민 대시보드
│   ├── products/page.tsx               # 상품 승인/반려
│   ├── orders/
│   │   ├── page.tsx                    # 전체 주문 관리
│   │   └── [orderNumber]/page.tsx      # 주문 상세 (배송완료 처리)
│   ├── sellers/page.tsx                # 판매자 신청 승인/반려
│   ├── categories/page.tsx             # 카테고리 관리 (CRUD, 가시성)
│   ├── settlements/page.tsx            # 정산 확인/지급
│   └── audit-logs/page.tsx             # 감사 로그 조회
│
└── not-found.tsx                       # 404

3. 컴포넌트 계층 구조

frontend/src/
├── components/
│   ├── common/                         # Atomic 기초 컴포넌트
│   │   ├── Button.tsx                  # 공통 버튼 (variant: primary/secondary/danger/ghost)
│   │   ├── Input.tsx                   # 텍스트 인풋 (label, error 포함)
│   │   ├── Select.tsx                  # 셀렉트 박스
│   │   ├── Textarea.tsx               # 텍스트에리어
│   │   ├── Modal.tsx                   # 모달 다이얼로그
│   │   ├── Badge.tsx                   # 상태 뱃지 (주문상태, 승인상태 등)
│   │   ├── Pagination.tsx             # 페이지네이션
│   │   ├── Table.tsx                   # 테이블 (admin/seller 목록용)
│   │   ├── Card.tsx                    # 카드 컨테이너
│   │   ├── Spinner.tsx                # 로딩 스피너
│   │   ├── EmptyState.tsx             # 빈 상태 표시
│   │   └── Rating.tsx                  # 별점 표시/입력
│   │
│   ├── layout/                         # 레이아웃 컴포넌트
│   │   ├── Header.tsx                  # 글로벌 헤더 (로고, 네비, 카트 아이콘, 유저 메뉴)
│   │   ├── Footer.tsx                  # 글로벌 푸터
│   │   ├── Sidebar.tsx                # 사이드바 (my/seller/admin 공용)
│   │   └── CategoryNav.tsx            # 카테고리 네비게이션 바
│   │
│   ├── auth/                           # 인증 관련
│   │   ├── LoginForm.tsx              # 로그인 폼 (react-hook-form + zod)
│   │   └── RegisterForm.tsx           # 회원가입 폼
│   │
│   ├── product/                        # 상품 관련
│   │   ├── ProductCard.tsx            # 상품 카드 (목록용)
│   │   ├── ProductGrid.tsx            # 상품 그리드 레이아웃
│   │   ├── ProductDetail.tsx          # 상품 상세 정보
│   │   ├── ProductForm.tsx            # 상품 등록/수정 폼 (seller)
│   │   ├── ProductFilter.tsx          # 필터 (카테고리, 정렬)
│   │   └── ProductImageUpload.tsx     # 이미지 업로드 (seller)
│   │
│   ├── cart/                           # 장바구니
│   │   ├── CartItem.tsx               # 장바구니 아이템
│   │   └── CartSummary.tsx            # 합계/결제 버튼
│   │
│   ├── order/                          # 주문 관련
│   │   ├── OrderCard.tsx              # 주문 카드 (목록용)
│   │   ├── OrderDetail.tsx            # 주문 상세
│   │   ├── OrderStatusBadge.tsx       # 주문 상태 뱃지
│   │   ├── ShipmentInfo.tsx           # 배송 정보
│   │   └── CheckoutForm.tsx           # 주문서 폼 (배송지, 수령인)
│   │
│   ├── payment/                        # 결제
│   │   └── PaymentButton.tsx          # PortOne 결제 트리거
│   │
│   ├── review/                         # 리뷰
│   │   ├── ReviewList.tsx             # 리뷰 목록
│   │   ├── ReviewItem.tsx             # 리뷰 아이템
│   │   └── ReviewForm.tsx             # 리뷰 작성/수정 폼
│   │
│   ├── inquiry/                        # 문의
│   │   ├── InquiryList.tsx            # 문의 목록
│   │   ├── InquiryItem.tsx            # 문의 아이템 (질문 + 답변)
│   │   ├── InquiryForm.tsx            # 문의 작성 폼
│   │   └── InquiryAnswerForm.tsx      # 답변 작성 폼 (seller)
│   │
│   ├── wishlist/                       # 위시리스트
│   │   └── WishlistToggle.tsx         # 하트 토글 버튼
│   │
│   ├── seller/                         # 판매자 관련
│   │   ├── SellerApplyForm.tsx        # 판매자 신청 폼
│   │   ├── SellerOrderTable.tsx       # 셀러 주문 테이블
│   │   └── SettlementTable.tsx        # 정산 테이블
│   │
│   └── admin/                          # 관리자 관련
│       ├── ProductApprovalTable.tsx    # 상품 승인 테이블
│       ├── SellerApplicationTable.tsx  # 판매자 신청 테이블
│       ├── CategoryManager.tsx        # 카테고리 트리 관리
│       └── AuditLogTable.tsx          # 감사 로그 테이블
│
├── hooks/                              # Custom Hooks (TanStack Query v5)
│   ├── useAuth.ts                     # 로그인/로그아웃/인증 상태
│   ├── useProducts.ts                 # 상품 CRUD queries/mutations
│   ├── useCart.ts                     # 장바구니 queries/mutations
│   ├── useOrders.ts                   # 주문 queries/mutations
│   ├── usePayment.ts                  # 결제 mutations
│   ├── useReviews.ts                  # 리뷰 queries/mutations
│   ├── useInquiries.ts               # 문의 queries/mutations
│   ├── useWishlist.ts                 # 위시리스트 queries/mutations
│   ├── useSeller.ts                   # 셀러 관련
│   ├── useSettlements.ts             # 정산 관련
│   ├── useCategories.ts              # 카테고리 조회
│   └── useAuditLogs.ts               # 감사 로그 (admin)
│
├── lib/
│   ├── api/
│   │   └── client.ts                  # axios 인스턴스 (인터셉터, 토큰 갱신)
│   ├── providers/
│   │   ├── QueryProvider.tsx          # TanStack Query v5 Provider ('use client')
│   │   └── EmotionProvider.tsx        # Emotion SSR Registry ('use client')
│   └── utils/
│       ├── format.ts                  # 가격, 날짜 포맷
│       └── auth.ts                    # 토큰 저장/조회
│
└── styles/
    └── theme.ts                       # 색상, 타이포그래피, 간격 토큰

4. 핵심 설계 포인트
Server Component vs Client Component 구분
구분	Server Component	Client Component ('use client')
사용처	layout.tsx, page.tsx (데이터 없는 셸)	폼, 인터랙션, Emotion styled, TanStack Query
이유	Next.js 15 기본이 Server Component	Emotion은 런타임 CSS-in-JS로 클라이언트 필수
패턴: 각 page.tsx는 Server Component로 두고, 실제 UI는 Client Component를 import하여 렌더링합니다.

// app/products/page.tsx (Server Component)
import { ProductListPage } from '@/components/product/ProductGrid';
export default function Page() {
  return <ProductListPage />;
}


TanStack Query v5 주의사항
* isLoading → isPending 사용
* cacheTime → gcTime 사용
* QueryClientProvider는 Client Component에서 설정

Shared 타입 활용

import type { Product, OrderStatus, Review } from '@shopping-mall/shared';

5. 주요 페이지별 API 연동 시나리오
페이지	API 호출	주요 인터랙션
홈	GET /products, GET /categories	카테고리 네비게이션, 상품 카드 클릭
상품 목록	GET /products?categoryId=&page=	필터, 페이지네이션, 위시리스트 토글
상품 상세	GET /products/:id, GET /v1/reviews/product/:id, GET /v1/inquiries/product/:id	장바구니 추가, 리뷰/문의 탭 전환
장바구니	GET /cart, PATCH /cart/items/:id, DELETE /cart/items/:id	수량 변경, 삭제, 선택 주문
주문서(체크아웃)	POST /orders	배송지 입력 → 주문 생성 → 결제
결제	POST /payments/verify	PortOne SDK 호출 → 검증
주문 내역	GET /orders	주문 카드 클릭, 취소, 구매확정
주문 상세	GET /orders/:orderNumber	배송 추적, 결제 취소, 리뷰 작성
위시리스트	GET /v1/wishlist, POST /v1/wishlist/toggle	토글, 장바구니 이동
리뷰 관리	GET /v1/reviews/my, PATCH/DELETE /v1/reviews/:id	수정, 삭제
판매자 신청	POST /seller/apply, GET /seller/me	폼 제출, 상태 확인
셀러 상품 관리	GET /products/my, POST /products, PATCH/DELETE /products/:id	등록, 수정, 삭제
셀러 주문 관리	GET /seller/orders, PATCH /seller/orders/:orderNumber/ship	배송 처리 (송장 입력)
셀러 정산	GET /v1/seller/settlements, GET /v1/seller/settlements/summary	요약 카드, 목록
어드민 상품	GET /admin/products, PATCH /admin/products/:id/approve|reject	승인/반려 (사유 입력)
어드민 판매자	GET /seller/applications, PATCH /seller/applications/:id/approve|reject	승인/반려
어드민 카테고리	GET /categories, POST/PATCH/DELETE /admin/categories	트리 CRUD
어드민 정산	GET /v1/admin/settlements, PATCH confirm/pay	확인, 지급 처리
감사 로그	GET /v1/admin/audit-logs	필터, 페이지네이션
6. 추가 확인이 필요한 파일 목록
현재 backend/shared 외에 다음 파일을 확인하면 더 정확한 구현이 가능합니다:

파일	이유
frontend/src/app/layout.tsx	기존 레이아웃 구조 확인
frontend/src/app/page.tsx	기존 홈 페이지 확인
frontend/next.config.*	Next.js 설정 (Emotion SWC 플러그인 등)
frontend/tsconfig.json	path alias 설정 (@/, @shopping-mall/shared)
frontend/project.json	Nx 프로젝트 설정
nx.json	워크스페이스 설정, shared 라이브러리 참조 방식
tsconfig.base.json	모노레포 루트 path mapping
shared/src/index.ts	shared 라이브러리 export 구조 확인
