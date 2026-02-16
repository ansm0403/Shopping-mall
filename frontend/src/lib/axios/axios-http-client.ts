import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { authStorage } from '../../../src/service/auth-storage';

const baseConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // 쿠키를 자동으로 포함
};

// Refresh Token 관리를 위한 전역 상태
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;
const MAX_RETRY_COUNT = 3;
const REFRESH_API_ENDPOINT = '/auth/refresh';

// 공개 API용 클라이언트 (인증 불필요)
export const publicClient = axios.create(baseConfig);

publicClient.interceptors.request.use(
  (config) => {
    console.log('[Public API] 요청 전 : ', config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 인증 필요 API용 클라이언트
export const authClient = axios.create(baseConfig);

authClient.interceptors.request.use(
  (config) => {
    // localStorage와 sessionStorage 둘 다 확인
    const token = authStorage.getAccessToken();

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log('[Auth API] 요청 전 : ', config.url);

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Refresh Token을 사용하여 새로운 Access Token 발급
 * Race Condition 방지를 위해 Promise 기반 동기화 사용
 * refreshToken은 httpOnly 쿠키에 저장되어 자동으로 전송됨
 */
const refreshAccessToken = async (): Promise<string | null> => {
  // 이미 refresh 중이면 기존 Promise 반환 (Race Condition 방지)
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;

  refreshPromise = (async () => {
    try {
      // refreshToken은 쿠키에 저장되어 있어 자동으로 전송됨 (withCredentials: true)
      const response = await publicClient.post(REFRESH_API_ENDPOINT);

      const { accessToken } = response.data;

      // localStorage 또는 sessionStorage에 저장 (기존에 저장된 위치에)
      authStorage.setAccessToken(accessToken, authStorage.isRememberMe())

      return accessToken;
    } catch {
      // Refresh Token도 만료된 경우
      authStorage.clearToken();

      // 로그인 페이지로 리다이렉트
      window.location.href = '/login';
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();
  return refreshPromise;
};

authClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: number;
    };

    // Refresh API 엔드포인트는 interceptor 로직에서 제외
    if (originalRequest?.url?.includes(REFRESH_API_ENDPOINT)) {
      return Promise.reject(error);
    }

    // 401 Unauthorized 에러 처리
    if (error.response?.status === 401 && originalRequest) {
      // 재시도 횟수 확인 (무한 재시도 방지)
      const retryCount = originalRequest._retry || 0;

      if (retryCount >= MAX_RETRY_COUNT) {
        console.error('[Auth API] 최대 재시도 횟수 초과');

        // 로그인 페이지로 리다이렉트
        authStorage.clearToken();

        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        // Access Token 갱신
        const newAccessToken = await refreshAccessToken();

        if (!newAccessToken) {
          return Promise.reject(error);
        }

        // 재시도 횟수 증가
        originalRequest._retry = retryCount + 1;
        originalRequest.headers = originalRequest.headers ?? {};
        // 새로운 토큰으로 헤더 업데이트
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // 원래 요청 재시도
        return authClient(originalRequest);
      } catch (refreshError) {
        console.error('[Auth API] Token refresh 실패:', refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// 하위 호환성을 위한 기본 export (기존 코드와의 호환)
// 점진적 마이그레이션을 위해 authClient를 기본으로 사용
export const httpClient = authClient;
