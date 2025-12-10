/**
 * 로그인 요청 타입
 * Next.js 클라이언트와 Nest.js 서버 간 데이터 형식 정의
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * 로그인 응답 타입
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: 'user' | 'admin';
  };
}

/**
 * 토큰 갱신 요청 타입
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * 토큰 갱신 응답 타입
 */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * 로그아웃 요청 타입
 */
export interface LogoutRequest {
  accessToken: string;
  refreshToken: string;
}
