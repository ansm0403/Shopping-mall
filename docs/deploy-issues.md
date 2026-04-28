# 배포 환경 주요 이슈 — 실무 기준 설명

> 대상 독자: 초보 개발자
> 설명 방식: 이론 ❌ / 실제 서비스 흐름 + 데이터 이동 경로 ✅

---

## 이슈 1. `sameSite: 'strict'` → `'lax'`

### 먼저 알아야 할 것: "쿠키는 언제 브라우저가 보내는가?"

브라우저는 쿠키를 무조건 보내지 않는다.
서버가 쿠키를 Set-Cookie로 설정할 때 **SameSite 규칙**을 함께 지정하면,
브라우저는 "어디서 온 요청인지"에 따라 쿠키를 보낼지 말지 결정한다.

```
SameSite=Strict → 현재 사이트에서 출발한 요청에만 쿠키를 붙인다
SameSite=Lax    → 현재 사이트 요청 + 외부에서 우리 사이트로 오는 링크 클릭에도 쿠키를 붙인다
SameSite=None   → 항상 쿠키를 붙인다 (Secure 필수)
```

---

### 시나리오 1: 이메일 인증 링크 클릭 후 로그인이 안 됨

#### `sameSite: 'strict'` 일 때 — 현재 문제 있는 흐름

```
1. 사용자가 회원가입 → 이메일 발송
   (링크: https://shopping-mall-frontend-dusky.vercel.app/verify-email?token=abc123)

2. 사용자가 Gmail에서 링크 클릭
   → 브라우저 주소창: mail.google.com → vercel.app 으로 이동
   → 이건 "외부 사이트(Gmail)에서 우리 사이트로 오는 네비게이션"
   → SameSite=Strict: 이 이동 자체에는 기존 쿠키를 붙이지 않는다 ← 핵심

3. 프론트엔드 /verify-email 페이지 로드
   → 페이지 JS가 /api/auth/verify-email?token=abc123 호출
   → 백엔드가 토큰 검증 후 응답:
      Set-Cookie: refreshToken=xxx; HttpOnly; Secure; SameSite=Strict; Path=/
   → 브라우저가 이 쿠키를 저장함 ← 여기까지는 정상

4. 이후 사용자가 다른 페이지로 이동
   → 프론트엔드가 /api/auth/refresh 호출 (세션 유지 확인)
   → 이 요청은 vercel.app 내에서 발생한 same-origin fetch
   → SameSite=Strict: 같은 사이트에서 출발했으므로 쿠키 포함 ← 정상

5. BUT — 이메일 인증 후 자동 로그인 리다이렉트 시나리오:
   → /verify-email 페이지에서 로그인 처리 후 → /dashboard 로 router.push
   → 이 시점에 accessToken이 localStorage에 없다면 인증 실패
   → 로그인 페이지로 튕겨남
```

> ❗ 현재 이메일 인증 실패 문제의 원인 중 하나가 여기에 있을 수 있다.

#### `sameSite: 'lax'` 일 때 — 수정 후 흐름

```
위의 모든 단계가 동일하지만:
→ Lax는 외부 링크 클릭 후 우리 사이트 GET 요청에도 쿠키를 포함한다
→ 더 유연한 쿠키 전송으로 세션 유지 가능성 ↑
```

---

### 시나리오 2: 포트원 결제 완료 후 세션이 끊김

#### `sameSite: 'strict'` 일 때 — 결제 리다이렉트 흐름

```
1. 사용자가 vercel.app/checkout 에서 결제 버튼 클릭
   → 포트원 결제 iframe 또는 팝업 오픈

2. 결제 완료 후 포트원이 콜백:
   → 경우 A: vercel.app/order/complete 로 리다이렉트
     (주소창: portone.io → vercel.app 이동)
   → 경우 B: 포트원 iframe 내에서 콜백 후 부모 창에 postMessage

3. 경우 A — 리다이렉트로 돌아올 때:
   → "외부(portone.io)에서 우리 사이트로 오는 네비게이션"
   → SameSite=Strict: 이 최초 네비게이션 요청에는 쿠키 없음

4. /order/complete 페이지 JS 실행 → 주문 확인 API 호출
   → /api/orders/xxx (same-origin fetch)
   → SameSite=Strict: same-origin이므로 쿠키 포함 ← 이건 정상
   → 하지만 Next.js 미들웨어나 서버사이드에서 인증 검사를 한다면?
      → 최초 네비게이션 요청에 쿠키가 없어서 로그인 페이지로 튕겨남

5. 결과: "결제는 됐는데 주문 완료 화면을 못 보고 로그인 화면으로 튕겨남"
```

#### 왜 로컬에서는 잘 됐는가?

```
로컬 개발 환경:
- Frontend: http://localhost:3000
- Backend:  http://localhost:4000

→ localhost는 SameSite 규칙의 예외 대상이다
→ 브라우저가 localhost를 "안전한 환경"으로 취급해서
   SameSite=Strict이어도 사실상 Lax처럼 동작함

배포 환경:
- Frontend: https://shopping-mall-frontend-dusky.vercel.app
- 외부 유입: mail.google.com, portone.io 등

→ 실제 도메인에서는 SameSite 규칙이 엄격하게 적용됨
→ 같은 코드인데 로컬에서 되고 배포에서 안 되는 원인
```

---

### 시나리오 3: nginx+HTTPS 전환 후 완전히 망가지는 케이스

```
현재 구조 (프록시):
- 브라우저 → /api/* (vercel.app, same-origin)
- 쿠키 도메인: vercel.app
- same-origin fetch이므로 SameSite=Strict이어도 쿠키 전송 OK

nginx+HTTPS 전환 후:
- 브라우저 → https://api.yourdomain.com/v1/* (다른 도메인, cross-origin)
- 쿠키 도메인: vercel.app
- "vercel.app에 있는 쿠키"를 "api.yourdomain.com"으로 보내는 것
  → SameSite=Strict: 완전 다른 사이트 → 쿠키 100% 차단
  → 모든 인증 API 요청에서 refreshToken 쿠키가 없음
  → 로그인 불가, 세션 유지 불가, 모든 인증 필요 기능 동작 안 함

→ Lax로 바꿔도 cross-origin fetch에는 쿠키가 안 붙는다
→ 해결: nginx+HTTPS 전환 시 SameSite=None; Secure 또는 별도 쿠키 전략 검토
   (또는 Access Token을 Authorization 헤더로만 보내고 쿠키는 완전히 배제)
```

> ⚠️ 지금 당장은 lax로 충분하지만, nginx+HTTPS 전환 시 이 문제를 다시 검토해야 한다.

---

### 해결 코드 (적용됨)

```typescript
// backend/src/auth/auth.controller.ts

private setRefreshCookie(res: Response, refreshToken: string, isPersistent: boolean) {
  const base = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,   // ← strict → lax 변경
    path: '/',
  }
  // ...
}
```

```typescript
// logout의 clearCookie — setRefreshCookie와 옵션 일치시켜야 삭제가 동작함
res.clearCookie('refreshToken', {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',   // ← strict → lax 변경
  path: '/',
});
```

> 🔑 **clearCookie 규칙**: 쿠키를 삭제하려면 Set-Cookie 때와 정확히 같은 옵션(path, sameSite, domain, secure)을 써야 한다.
> 옵션이 하나라도 다르면 브라우저는 "다른 쿠키를 삭제하려는 것"으로 인식해서 **로그아웃해도 쿠키가 남는다**.

---

---

## 이슈 2. `synchronize: true` → `process.env.NODE_ENV !== 'production'`

### 먼저 알아야 할 것: TypeORM `synchronize`가 하는 일

TypeORM의 `synchronize: true`는
"앱이 시작될 때 엔티티 코드를 보고 DB 테이블 구조를 자동으로 맞춰준다"는 설정이다.

```
Node.js 앱 시작
   │
   ▼
TypeORM: 엔티티 파일 스캔
   │
   ▼
DB의 현재 테이블 구조와 비교
   │
   ├── 컬럼 추가됨 → ALTER TABLE ... ADD COLUMN ...
   ├── 컬럼 이름 바뀜 → DROP COLUMN old + ADD COLUMN new
   ├── 컬럼 타입 바뀜 → DROP COLUMN + ADD COLUMN (데이터 삭제)
   └── 컬럼 삭제됨 → DROP COLUMN (데이터 삭제)
```

개발할 때는 편리하다. 엔티티 수정하면 DB가 자동으로 따라온다.
하지만 이건 **"묻지도 따지지도 않고 실행한다"**.

---

### 시나리오 1: 컬럼 이름 변경 → 데이터 완전 소멸

```
[상황]
- 운영 DB users 테이블에 'phone_number' 컬럼이 있고
  실제 사용자 1000명의 전화번호가 저장되어 있다

[개발자가 한 일]
- 코드에서 phone_number → phoneNumber 로 필드명 변경
  (JavaScript 관례인 camelCase로 통일하고 싶었음)

[배포 순간 일어나는 일]
1. EC2에서 docker compose up 실행
2. NestJS 앱 시작
3. TypeORM synchronize: 엔티티 스캔
4. DB에 'phone_number' 컬럼이 있는데 엔티티에는 없음
   → DROP COLUMN phone_number  ← 1000명 전화번호 삭제
5. 엔티티에 'phoneNumber' 컬럼이 있는데 DB에 없음
   → ADD COLUMN phoneNumber
6. 앱 정상 실행됨

[결과]
- 에러도 없음
- 앱도 정상 동작함
- 1000명의 전화번호만 조용히 사라짐
- 발견 시점: "왜 전화번호 정보가 없냐"는 고객 문의가 들어온 후
```

---

### 시나리오 2: 컬럼 타입 변경 → 앱 시작조차 안 됨

```
[상황]
- orders 테이블의 'total_price' 컬럼이 VARCHAR 타입이었는데
  계산 오류가 있어서 DECIMAL 타입으로 변경하기로 결정

[개발자가 한 일]
- 엔티티에서 @Column({ type: 'varchar' }) → @Column({ type: 'decimal' }) 로 수정

[배포 순간 일어나는 일]
1. TypeORM이 컬럼 타입 불일치 감지
2. 기존 varchar 컬럼 삭제 + decimal 컬럼 새로 생성 시도
3. 그런데 기존 데이터에 '1만원', '무료' 같은 숫자가 아닌 값이 있었다면?
   → DECIMAL 변환 실패 → DB 에러
   → 앱 시작 실패 → 서비스 전체 다운

[결과]
- 새벽 배포 → 아침에 일어나보니 서비스가 완전히 죽어있음
- DB는 이미 일부 변경됨 (중간 상태)
- 롤백도 쉽지 않음
```

---

### 시나리오 3: NOT NULL 컬럼 추가 → 조용한 폭탄

```
[상황]
- users 테이블에 'last_login_ip' 컬럼 추가
- 기존 사용자 데이터에는 당연히 이 값이 없음

[코드]
@Column({ nullable: false })  // NOT NULL
lastLoginIp: string;

[배포 순간]
1. TypeORM: ALTER TABLE users ADD COLUMN last_login_ip VARCHAR NOT NULL
2. 기존 row 1000개에 모두 NOT NULL인데 값이 없음
3. DB 에러: "column ... of relation ... contains null values"
4. 앱 시작 실패

[또는]
nullable: true 로 설정했는데 나중에 코드에서 lastLoginIp가 undefined일 때를 처리 안 하면
→ 런타임 에러가 여기저기서 발생
```

---

### 왜 로컬에서는 문제가 없었는가?

```
로컬 개발:
- DB 데이터가 없거나 테스트 데이터만 있음
- 데이터가 날아가도 "다시 시드 데이터 넣으면 되지"
- 스키마 꼬여도 DB 컨테이너 재시작으로 초기화
- 개발자 혼자 쓰므로 영향받는 사람이 없음

배포 환경:
- 실제 사용자 데이터가 축적됨
- 데이터 날아가면 복구 방법 없음 (백업 없다면)
- 앱 죽으면 서비스 전체 중단
- 데이터 손실은 법적 문제로 이어질 수 있음
```

---

### 실제로 어떤 사고가 났는지 (실무 사례)

실제 스타트업에서 이런 일이 일어났다:

```
상황:
- 사용자 포인트(point) 컬럼을 int에서 bigint로 변경
- synchronize: true 상태로 배포

결과:
- TypeORM이 컬럼 DROP 후 재생성
- 기존 포인트 데이터 전부 초기화 (0이 됨)
- 사용자들이 포인트를 쓰려고 접속 → "포인트 0?" 문의 폭발
- 백업 없어서 복구 불가
- 결국 보상 정책으로 포인트 일괄 지급
```

---

### 해결 코드 (적용됨)

```typescript
// backend/src/app/app.module.ts

TypeOrmModule.forRoot({
  type: 'postgres',
  // ...
  synchronize: process.env.NODE_ENV !== 'production', // ← 수정됨
}),
```

```
로컬 (NODE_ENV=development): synchronize: true  → 개발 편의 유지
배포 (NODE_ENV=production):  synchronize: false → 자동 스키마 변경 차단
```

---

### 앞으로 스키마 변경하려면?

`synchronize: false` 이후에는 TypeORM의 **Migration** 기능을 사용해야 한다.

```
기존 방식:
엔티티 수정 → 배포 → TypeORM이 알아서 DB 변경 (위험)

Migration 방식:
엔티티 수정
→ migration 파일 생성 (어떻게 바꿀지 명시적으로 작성)
→ 개발 DB에서 먼저 테스트
→ 배포
→ migration 실행 (명시적으로 실행해야 함)
→ DB 변경됨 (예측 가능, 롤백 가능)
```

> 지금 당장 Migration을 도입하지 않아도 된다.
> 하지만 `synchronize: false`로 바꾼 후 스키마를 바꿔야 할 때는
> 배포 전에 EC2에서 수동으로 SQL을 실행하거나,
> 또는 임시로 `synchronize: true` 로 한 번 실행 후 다시 false로 되돌리는 방법을 쓸 수 있다.
> (위험하지만 소규모 포트폴리오 단계에서는 현실적인 절충안)

---

## 요약

| 이슈 | 문제 | 왜 로컬에선 됨 | 실제 사고 | 수정 |
|---|---|---|---|---|
| `sameSite: strict` | 이메일 링크 / 결제 리다이렉트 후 쿠키 누락 → 세션 끊김 | localhost는 SameSite 규칙 예외 적용 | 로그인 풀림, 결제 후 세션 종료 | `lax`로 변경 |
| `synchronize: true` | 배포 시 엔티티 변경이 DB에 자동 반영 → 데이터 손실 | 개발 DB는 테스트 데이터라 날아가도 무방 | 컬럼 DROP으로 사용자 데이터 소멸 | `NODE_ENV !== 'production'`으로 조건부 |
