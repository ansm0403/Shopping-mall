import { NextResponse } from 'next/server';
import { parseRefreshToken, isPersistentCookie } from '../_lib/cookie';

// 서버사이드 전용 환경변수 — next.config.js rewrites()와 동일한 타깃
const BACKEND = process.env.API_PROXY_TARGET || 'http://localhost:4000/v1';

export async function POST(req: Request) {
  const body = await req.json();

  const upstream = await fetch(`${BACKEND}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // EC2가 IP 기반 레이트리밋/로깅에 사용
      'X-Forwarded-For': req.headers.get('x-forwarded-for') ?? '',
      'User-Agent':      req.headers.get('user-agent')      ?? '',
    },
    body: JSON.stringify(body),
  });

  const data = await upstream.json();
  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  // EC2의 Set-Cookie에서 refreshToken을 추출 → Vercel 도메인 기준으로 재발급
  const setCookieHeader = upstream.headers.get('set-cookie');
  const refreshToken    = parseRefreshToken(setCookieHeader);
  const persistent      = isPersistentCookie(setCookieHeader);

  const res = NextResponse.json({
    accessToken: data.accessToken,
    expiresIn:   data.expiresIn,
    tokenType:   data.tokenType,
    user:        data.user,
  });

  if (refreshToken) {
    res.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path:     '/',
      ...(persistent ? { maxAge: 7 * 24 * 60 * 60 } : {}),
    });
  }

  return res;
}
