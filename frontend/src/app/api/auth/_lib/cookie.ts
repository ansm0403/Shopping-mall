/** EC2 Set-Cookie 헤더에서 refreshToken 값만 추출 */
export function parseRefreshToken(setCookie: string | null): string | null {
  if (!setCookie) return null;
  const match = setCookie.match(/refreshToken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/** EC2 Set-Cookie 헤더에 Max-Age가 있으면 persistent 세션으로 판단 */
export function isPersistentCookie(setCookie: string | null): boolean {
  return !!setCookie && /Max-Age=\d+/i.test(setCookie);
}
