# 프록시 방식 전환 수정 기록

> 작성일: 2026-04-24
> 목적: 프록시(Vercel rewrites) 방식으로 운영하면서, 향후 nginx + HTTPS 전환 시 코드 위치를 잃지 않기 위한 변경 이력 기록

---

## 1. 수정된 파일 목록

### [수정] `backend/src/auth/auth.controller.ts`

#### 변경 내용
| 위치 | 변경 전 | 변경 후 | 이유 |
|---|---|---|---|
| `setRefreshCookie` 함수 | `sameSite: 'strict'` | `sameSite: 'lax'` | 이메일 링크 / 결제 리다이렉트 등 cross-site 유입 시 쿠키 누락 방지 |
| `logout` → `clearCookie` | `sameSite: 'strict'` | `sameSite: 'lax'` | setRefreshCookie와 옵션 일치 (불일치 시 쿠키 삭제 미작동) |

#### 삭제된 코드
없음 (단순 값 변경)

#### 보관된 코드
없음 — `lax`는 프록시 방식과 nginx+HTTPS 방식 **양쪽 모두에서 동작**하므로 별도 보관 불필요.

---

### [수정] `backend/src/app/app.module.ts`

#### 변경 내용
| 위치 | 변경 전 | 변경 후 | 이유 |
|---|---|---|---|
| TypeORM `synchronize` | `synchronize: true` | `synchronize: process.env.NODE_ENV !== 'production'` | 프로덕션 환경에서 자동 스키마 변경으로 인한 데이터 손실 방지 |

#### 삭제된 코드
없음

#### 보관된 코드
없음 — 이 설정도 프록시/nginx+HTTPS 구분 없이 **양쪽 모두에 동일하게 적용**.

---

### [주석 보강] `frontend/next.config.js`

#### 로직 변경 없음 — 주석 레이블만 추가

이 파일은 이미 두 방식의 코드가 모두 존재한다.

| 줄 범위 | 상태 | 내용 | 방식 |
|---|---|---|---|
| 6~17줄 | **주석 처리됨** (보관) | `apiUrl` / `apiOrigin` 기반 CSP connectSrc | **nginx+HTTPS 방식** |
| 19~26줄 | **현재 활성** | `connectSrc: "'self'"` (프록시 덕에 same-origin) | **프록시 방식** |
| 125~132줄 | **현재 활성** | `rewrites()` — `/api/*` → EC2 프록시 | **프록시 방식** |

> ✅ **nginx+HTTPS 전환 시 해야 할 것** (코드는 이미 주석으로 보관됨):
> 1. 6~17줄 주석 해제
> 2. 19~26줄 (`connectSrc: "'self'"`) 주석 처리 또는 제거
> 3. 125~132줄 (`rewrites()` 블록) 주석 처리 또는 제거
> 4. Vercel 환경변수 변경: `NEXT_PUBLIC_API_URL=/api` → `https://api.yourdomain.com/v1`
> 5. Vercel 환경변수 `API_PROXY_TARGET` 제거

---

## 2. 건드리지 않은 파일

| 파일 | 이유 |
|---|---|
| `backend/src/main.ts` (Helmet CSP) | 배포 환경에서 API 요청 정상 동작 중. 변경 시 예기치 않은 문제 발생 가능성 존재. |
| `frontend/src/lib/axios/axios-http-client.ts` | Vercel 환경변수 `NEXT_PUBLIC_API_URL=/api`로 이미 프록시 경유. 코드 변경 불필요. |
| `docker-compose.yaml` | 정상 동작 중. |

---

## 3. 프록시 방식 vs nginx+HTTPS 방식 구조 비교

### 3-1. 요청 흐름 비교

```
[프록시 방식 — 현재]

Browser (HTTPS)
  │ fetch /api/products
  ▼
Vercel Edge (https://shopping-mall-frontend-dusky.vercel.app)
  │ next.config.js rewrites:
  │ /api/* → http://43.201.118.88:4000/v1/*  (서버사이드, 브라우저 모름)
  ▼
EC2 :4000 (HTTP) ← 이 구간만 평문 HTTP


[nginx+HTTPS 방식 — 향후]

Browser (HTTPS)
  │ fetch https://api.yourdomain.com/v1/products  (직접 호출)
  ▼
EC2 :443 — Nginx (HTTPS 종단)
  │ proxy_pass http://127.0.0.1:4000
  ▼
EC2 :4000 (컨테이너 내부 HTTP, 외부 노출 없음)
```

---

### 3-2. 실제 코드 레벨 차이

| 항목 | 프록시 방식 (현재) | nginx+HTTPS 방식 (향후) |
|---|---|---|
| **axios baseURL** | `/api` | `https://api.yourdomain.com/v1` |
| **Vercel rewrites** | 활성화 (next.config.js 125~132줄) | 비활성화 |
| **CSP connectSrc** | `'self'` 만으로 충분 | `'self' https://api.yourdomain.com` 추가 필요 |
| **CORS 중요도** | 낮음 (브라우저가 EC2 직접 호출 안 함) | 높음 (브라우저가 API 도메인 직접 호출) |
| **쿠키 도메인** | Vercel 도메인에 저장 | Vercel 도메인에 저장 (동일) |
| **쿠키 Secure** | `true` — Vercel은 HTTPS ✓ | `true` — EC2도 HTTPS ✓ |
| **EC2 보안 그룹** | :4000 외부 오픈 필요 | :443만 오픈, :4000 차단 |
| **브라우저→서버 구간** | HTTPS (Vercel 도메인) | HTTPS (API 도메인) |
| **Vercel→EC2 구간** | HTTP (평문, 인터넷 경유) | HTTPS (암호화) ← 이게 핵심 차이 |

---

### 3-3. 방식별 장단점

| | 프록시 방식 | nginx+HTTPS 방식 |
|---|---|---|
| **구축 난이도** | 낮음 (도메인 불필요) | 중간 (도메인 + Nginx + certbot) |
| **보안** | 중간 (Vercel→EC2 평문 구간 존재) | 높음 (전 구간 암호화) |
| **토큰 노출 위험** | Vercel→EC2 구간에서 이론적 탈취 가능 | 없음 |
| **유지보수** | 간단 | Nginx 설정 + 인증서 갱신 관리 |
| **포트폴리오 적합성** | 빠른 배포용 | 실서비스 수준 |

---

## 4. nginx+HTTPS 전환 시 최종 체크리스트

전환 시점이 되면 아래 순서대로 진행:

```
[ ] 1. 도메인 발급 (예: Gabia, Cloudflare)
[ ] 2. EC2에 Elastic IP 연결 (이미 되어 있음: 43.201.118.88)
[ ] 3. 도메인 A 레코드 → Elastic IP 연결
[ ] 4. EC2에 Nginx 설치 + certbot으로 Let's Encrypt 인증서 발급
[ ] 5. Nginx: :443 → localhost:4000 reverse proxy 설정
[ ] 6. EC2 보안 그룹: 80, 443 오픈 / 4000 차단
[ ] 7. Vercel 환경변수:
        NEXT_PUBLIC_API_URL = https://api.yourdomain.com/v1  (변경)
        API_PROXY_TARGET 제거
[ ] 8. next.config.js:
        6~17줄 주석 해제 (nginx+HTTPS CSP)
        19~26줄 주석 처리 (프록시 CSP)
        125~132줄 주석 처리 (rewrites 블록)
[ ] 9. Vercel Redeploy
[ ] 10. 동작 확인: 로그인 → 결제 → 이메일 인증 흐름 테스트
```
