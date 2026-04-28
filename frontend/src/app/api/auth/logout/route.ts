import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const BACKEND = process.env.API_PROXY_TARGET || 'http://localhost:4000/v1';

export async function POST(req: Request) {
  const authorization = req.headers.get('authorization') ?? '';
  const cookieStore   = await cookies();
  const refreshToken  = cookieStore.get('refreshToken')?.value ?? '';

  // accessToken(Authorization 헤더)과 refreshToken(쿠키)을 모두 EC2로 전달
  // EC2 logout은 JwtAuthGuard를 통과해야 하므로 Authorization 헤더 필수
  await fetch(`${BACKEND}/auth/logout`, {
    method: 'POST',
    headers: {
      ...(authorization ? { Authorization: authorization } : {}),
      ...(refreshToken  ? { Cookie: `refreshToken=${refreshToken}` } : {}),
      'User-Agent': req.headers.get('user-agent') ?? '',
    },
  }).catch(() => {
    // 백엔드 logout 실패해도 브라우저 쿠키는 반드시 삭제
  });

  const res = NextResponse.json({ message: 'Logged out' });
  res.cookies.set('refreshToken', '', {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    maxAge:   0,
  });

  return res;
}
