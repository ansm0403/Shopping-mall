import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { parseRefreshToken, isPersistentCookie } from '../_lib/cookie';

const BACKEND = process.env.API_PROXY_TARGET || 'http://localhost:4000/v1';

export async function POST(req: Request) {
  const cookieStore  = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: 'Refresh token not found' }, { status: 401 });
  }

  const upstream = await fetch(`${BACKEND}/auth/refresh`, {
    method: 'POST',
    headers: {
      Cookie:      `refreshToken=${refreshToken}`,
      'User-Agent': req.headers.get('user-agent') ?? '',
    },
  });

  const data = await upstream.json();

  if (!upstream.ok) {
    // refresh 실패 → 브라우저 쿠키도 함께 삭제
    const res = NextResponse.json(data, { status: upstream.status });
    res.cookies.set('refreshToken', '', { maxAge: 0, path: '/' });
    return res;
  }

  const setCookieHeader  = upstream.headers.get('set-cookie');
  const newRefreshToken  = parseRefreshToken(setCookieHeader);
  const persistent       = isPersistentCookie(setCookieHeader);

  const res = NextResponse.json({
    accessToken: data.accessToken,
    expiresIn:   data.expiresIn,
    tokenType:   data.tokenType,
    user:        data.user,
  });

  if (newRefreshToken) {
    res.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path:     '/',
      ...(persistent ? { maxAge: 7 * 24 * 60 * 60 } : {}),
    });
  }

  return res;
}
