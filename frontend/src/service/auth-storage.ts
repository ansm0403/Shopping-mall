const ACCESS = 'accessToken';
const PERSIST = 'auth:persist';

export const authStorage = {
  setAccessToken: (accessToken: string, rememberMe: boolean) => {
    if(typeof window === 'undefined') return;

    localStorage.removeItem(ACCESS);
    sessionStorage.removeItem(ACCESS);

    if(rememberMe) {
      localStorage.setItem(ACCESS, accessToken);
      localStorage.setItem(PERSIST, '1');
    } else {
      sessionStorage.setItem(ACCESS, accessToken);
      localStorage.removeItem(PERSIST);
    }
  },
  getAccessToken: () => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(ACCESS) || localStorage.getItem(ACCESS);
    }
    return null;
  },
  clearToken: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(PERSIST);
    sessionStorage.removeItem(ACCESS);
  },
  isRememberMe() {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(PERSIST) === '1';
  }
}