# 브라우저 탭 간 로그인 상태 동기화 및 인증 시스템 개선

**일시**: 2026-04-05  
**주제**: React Query를 활용한 인증 상태 관리 및 기존 코드 점검/개선

---

## 1️⃣ 초기 질문: 탭 간 인증 상태 동기화

### 문제 정의
- 프론트에서 로그인/로그아웃 UI를 서버 상태 기준으로 보여줘야 함
- A 탭에서 사용자 정보 수정 → B 탭은 변경 사실을 알 수 없음
- 매번 서버에서 가져오면 서버 호출이 많아질 것 같음

### 해결책: 3가지 패턴
1. **React Query + `staleTime`**: 5분간 캐시 유지 → 불필요한 서버 호출 차단
2. **`refetchOnWindowFocus: true`** (React Query 기본값): 탭 포커스 시 자동 refetch
3. **BroadcastChannel / storage 이벤트**: 탭 간 즉시 동기화 (선택사항)

---

## 2️⃣ 기존 코드 점검 결과: 8가지 문제점

### P0 (심각도 높음)

#### 1. 로그아웃 시 서버 호출 안 됨
**파일**: `frontend/src/hook/useAuthMutation.ts` (line 40-43)

**문제**: `logout()` 함수 호출이 주석 처리됨

**왜 위험한가**:
- 백엔드 `/auth/logout` 엔드포인트가 accessToken 블랙리스트 추가 + refreshToken 무효화를 수행함
- 호출 안 하면 accessToken이 만료될 때까지 유효한 상태로 남음
- refreshToken 쿠키가 브라우저에 남아있어 누군가 이 쿠키로 새 accessToken 발급받을 수 있음

#### 2. `isLoggingOut` 플래그가 리셋되지 않을 수 있음
**파일**: `frontend/src/lib/axios/axios-http-client.ts` (line 14)

**문제**: 모듈 레벨 변수가 특정 상황에서 리셋되지 않을 수 있음

**위험 시나리오**:
- refresh token 만료 → `isLoggingOut = true` 설정
- 현재는 `window.location.href = '/login'` (전체 새로고침)으로 모듈 재실행되어 리셋됨
- **하지만** 누군가 `router.push('/login')`으로 바꾸면 모듈이 유지되어 리셋 안 됨
- 사용자가 다시 로그인해도 모든 API 요청이 차단됨

#### 3. `refresh` 엔드포인트에서 `throw new Error` 사용
**파일**: `backend/src/auth/auth.controller.ts` (line 134)

**문제**: NestJS에서 `new Error()`는 500 Internal Server Error로 처리됨  
→ 401 Unauthorized로 응답해야 클라이언트가 적절히 처리 가능

### P1 (중요도 중간)

#### 4. 모든 에러를 null로 삼킴
**파일**: `frontend/src/contexts/AuthContext.tsx` (line 86-88)

**문제**: 401(토큰 만료)뿐 아니라 500(서버 오류), 네트워크 오류도 비로그인 상태로 표시  
→ 서버 장애 시 로그인한 사용자가 갑자기 비로그인으로 보임

#### 5. `accessToken`을 body로 전송
**파일**: `frontend/src/service/auth.ts` (line 20-22)

**문제**:
- `authClient` request interceptor가 이미 Authorization 헤더에 accessToken 추가함
- body에도 중복으로 보내면 로깅 시 민감정보가 기록될 위험
- 설계상 불필요한 중복

#### 6. `queryClient.clear()` 과도함
**파일**: `frontend/src/hook/useAuthMutation.ts` (line 50)

**문제**: 상품 목록, 카테고리 등 인증과 무관한 캐시까지 전부 삭제  
→ 로그아웃 후 메인 페이지에서 모든 데이터 다시 fetch

### P2 (낮은 우선순위)

#### 7. `user` 타입 불일치
**파일**: `frontend/src/contexts/AuthContext.tsx` (line 13)

**수정**: `user: UserType`에서 `user: UserType | null`로 선언해야 함

#### 8. `getMe()` 반환 타입 미지정
**파일**: `frontend/src/service/auth.ts` (line 16-18)

**문제**: 반환 타입을 명시하지 않아 `response.data`의 타입 추론 불가

---

## 3️⃣ 핵심 개념: 모듈 레벨 변수와 리셋

### "모듈(Module)"이란?
JavaScript에서 각 파일은 하나의 모듈입니다. 모듈은 처음 import될 때 **딱 한 번만 실행**됩니다.

### 예시
```typescript
// auth-client.ts (모듈)
let isLoggingOut = false;

export function setLoggingOut(value: boolean) {
  isLoggingOut = value;
}
```

```typescript
// page-A.tsx와 page-B.tsx에서 import하면
// 둘 다 동일한 isLoggingOut 변수를 공유함
```

### 왜 리셋되는가?

#### ✅ `window.location.href = '/login'` (전체 새로고침)
```
1. 브라우저가 /login 페이지로 이동
2. 현재 로드된 모든 JavaScript 언로드 ← 중요!
3. 새로운 JavaScript 번들 다시 실행
   ↓
   let isLoggingOut = false; 다시 실행 ✅ 리셋!
```

#### ❌ `router.push('/login')` (클라이언트 네비게이션) - 위험
```
1. 브라우저 URL만 변경
2. 기존 JavaScript 번들은 메모리에 유지 ← 중요!
   ↓
   let isLoggingOut = true; 그대로 유지 ❌ 리셋 안 됨!
```

### 왜 리셋이 필요한가?

`isLoggingOut` 플래그는 **"지금 현재 로그아웃 처리 중인가?"**를 나타내야 합니다.

**시간 순서 비교:**

**✅ window.location.href (안전)**
```
⏰ 1. refresh token 만료
⏰ 2. isLoggingOut = true
⏰ 3. window.location.href = '/login' (전체 새로고침)
⏰ 4. 모듈 재실행 → isLoggingOut = false
⏰ 5. 사용자가 로그인 성공
⏰ 6. API 요청 시도 → isLoggingOut = false (정상)
✅ API 정상 작동
```

**❌ router.push (위험)**
```
⏰ 1. refresh token 만료
⏰ 2. isLoggingOut = true
⏰ 3. router.push('/login') (클라이언트 네비게이션)
⏰ 4. 모듈 유지 → isLoggingOut = true (리셋 안 됨!)
⏰ 5. 사용자가 로그인 성공
⏰ 6. API 요청 시도 → if (isLoggingOut) 체크 → true!
   → Promise.reject(new Error('Logging out...'))
🚫 모든 API 차단
🚫 "왜 로그인했는데 안 되지?" 무한 반복...
```

---

## 4️⃣ 코드 수정 사항

### ✅ 변경 1: Backend `auth.controller.ts`

**개선 내용**:
1. `throw new Error` → `throw new UnauthorizedException` (P0-3 해결)
2. `logout()` 메서드에서 body 대신 Authorization 헤더에서 accessToken 추출 (P1-2 해결)

```typescript
// refresh 엔드포인트
if (!refreshToken) {
    throw new UnauthorizedException('Refresh token not found');
}

// logout 엔드포인트
const accessToken = req.headers.authorization?.split(' ')[1] || '';
const result = await this.authService.logout(userId, accessToken, ...);
```

**효과**: 401 상태 코드로 적절한 오류 응답, 토큰 보안 강화

### ✅ 변경 2: Frontend `axios-http-client.ts`

**개선 내용**: `resetLoggingOutFlag()` 함수 export (P0-2 해결)

```typescript
export function resetLoggingOutFlag() {
  isLoggingOut = false;
}
```

**효과**: 향후 `router.push()` 방식으로 변경해도 안전한 구조

### ✅ 변경 3: Frontend `auth.ts`

**개선 내용**:
1. `logout()` body 제거 (P1-2 해결)
2. `getMe()` 반환 타입 명시 (P2-2 해결)
3. `UserResponse` 타입 export (P2-1 해결)

```typescript
export type UserResponse = Omit<User, 'password'>;

export async function logout() {
    return authClient.post<LogoutResponse>("/auth/logout");
}

export async function getMe() {
    return authClient.get<UserResponse>("/auth/me");
}
```

**효과**: 타입 안전성 + 보안 강화

### ✅ 변경 4: Frontend `useAuthMutation.ts`

**개선 내용**:
1. `logout()` 서버 호출 활성화 (P0-1 해결)
2. 로그인 성공 시 `resetLoggingOutFlag()` 호출 (P0-2 해결)
3. `queryClient.clear()` → `removeQueries(['auth'])` (P1-3 해결)
4. `onError` 핸들러 추가

```typescript
// 로그인
onSuccess: (response, variables) => {
    resetLoggingOutFlag(); // P0-2
    authStorage.setAccessToken(response.data.accessToken, variables.rememberMe);
    queryClient.setQueryData(['auth', 'user'], response.data.user);
}

// 로그아웃
mutationFn: () => logout(), // P0-1
onSuccess: () => {
    authStorage.clearToken();
    queryClient.removeQueries({ queryKey: ['auth'] }); // P1-3
    router.push('/login');
},
onError: () => {
    authStorage.clearToken();
    queryClient.removeQueries({ queryKey: ['auth'] });
    router.push('/login');
},
```

**효과**: 서버 로그아웃 + 안전한 플래그 리셋 + 캐시 정리

### ✅ 변경 5: Frontend `AuthContext.tsx`

**개선 내용**:
1. `user` 타입 수정 (P2-1 해결)
2. 에러 처리 개선: 401/403만 null, 나머지는 throw (P1-1 해결)

```typescript
interface AuthContextType {
  user: UserResponse | null; // P2-1
  isLoading: boolean;
  isAuthenticated: boolean;
  isHydrated: boolean;
}

// queryFn
try {
    const response = await getMe();
    return response.data;
} catch (error) {
    // P1-1: 401/403만 비로그인으로 처리
    if (isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
        return null;
    }
    // 네트워크/서버 오류는 React Query가 처리
    throw error;
}
```

**효과**: 타입 정확성 + 서버 장애와 토큰 만료 구분 처리

---

## 📋 최종 요약: 문제와 해결

| 문제 | 우선순위 | 원인 | 해결책 | 상태 |
|------|---------|------|--------|------|
| 로그아웃 서버 미호출 | P0 | 함수 호출 주석 | `logout()` 활성화 | ✅ |
| isLoggingOut 리셋 미흡 | P0 | 플래그 관리 부족 | `resetLoggingOutFlag()` 추가 + 로그인 시 호출 | ✅ |
| Error vs UnauthorizedException | P0 | 예외 처리 잘못됨 | NestJS 예외로 변경 | ✅ |
| 모든 에러를 null 삼킬 수 없음 | P1 | 과도한 catch | 401/403만 null, 나머지는 throw | ✅ |
| accessToken body 전송 | P1 | 설계 미흡 | Authorization 헤더로 통합 | ✅ |
| queryClient.clear() 과도함 | P1 | 캐시 정리 과도 | `removeQueries(['auth'])` 사용 | ✅ |
| user 타입 null 누락 | P2 | 타입 정의 오류 | `user: UserResponse \| null` | ✅ |
| getMe 반환 타입 미지정 | P2 | 타입 누락 | `<UserResponse>` 명시 | ✅ |

---

## 🎯 이 세션의 핵심 학습

1. **인증 상태 관리 패턴**: 캐싱 + 탭 동기화 메커니즘
2. **모듈 라이프사이클**: import → 실행 → 메모리 유지의 흐름
3. **전체 새로고침 vs 클라이언트 네비게이션**: 모듈 언로드 여부의 중요성
4. **보안 + 타입 안전성**: 동시에 고려하는 설계
5. **에러 처리의 정확성**: 상황별 다른 대응 필요

향후 `window.location.href` → `router.push()`로 마이그레이션해도 안전한 구조가 완성되었습니다.
