import { getAuthChannel } from './auth-channel';

const ACCESS = 'accessToken';
const PERSIST = 'auth:persist';

function broadcast(type: 'LOGIN' | 'LOGOUT' | 'TOKEN_REFRESHED') {
  try {
    const ch = getAuthChannel();
    ch?.postMessage({ type });
  } catch (error) {
    // BroadcastChannel이 지원되지 않거나 오류 발생 시 무시
    console.warn('Broadcast failed:', error);
  }
}

export const authStorage = {
  setAccessToken(token: string, rememberMe: boolean) {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(ACCESS);
    sessionStorage.removeItem(ACCESS);

    if (rememberMe) {
      localStorage.setItem(ACCESS, token);
      localStorage.setItem(PERSIST, '1');
    } else {
      sessionStorage.setItem(ACCESS, token);
      localStorage.removeItem(PERSIST);
    }

    broadcast('LOGIN');
  },

  refreshAccessToken(token: string) {
    if (typeof window === 'undefined') return;

    const rememberMe = localStorage.getItem(PERSIST) === '1';

    if (rememberMe) {
      localStorage.setItem(ACCESS, token);
    } else {
      sessionStorage.setItem(ACCESS, token);
    }

    broadcast('TOKEN_REFRESHED');
  },

  clearToken() {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(ACCESS);
    localStorage.removeItem(PERSIST);
    sessionStorage.removeItem(ACCESS);

    broadcast('LOGOUT');
  },

  getAccessToken() {
    return sessionStorage.getItem(ACCESS) || localStorage.getItem(ACCESS);
  },

  isRememberMe() {
    return localStorage.getItem(PERSIST) === '1';
  },

  // 다른 탭에서 토큰 요청 시 응답
  respondWithToken() {
    if (typeof window === 'undefined') return;

    const token = this.getAccessToken();
    if (token && !this.isRememberMe()) {
      // sessionStorage 모드일 때만 응답 (localStorage는 이미 공유됨)
      const ch = getAuthChannel();
      ch?.postMessage({ type: 'TOKEN_RESPONSE', accessToken: token });
    }
  },

  // 다른 탭에서 받은 토큰을 sessionStorage에 저장
  setTokenFromBroadcast(token: string) {
    if (typeof window === 'undefined') return;
    if (!this.isRememberMe()) {
      sessionStorage.setItem(ACCESS, token);
    }
  },
};