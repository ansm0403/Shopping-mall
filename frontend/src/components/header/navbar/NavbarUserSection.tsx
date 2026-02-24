import { useAuth } from '../../../contexts/AuthContext';
import Link from 'next/link';
import { NavbarButton } from './NavbarButton';
import React from 'react';
import { authStorage } from '../../../service/auth-storage';
import { useRouter } from 'next/navigation';
import { logout } from '../../../service/auth';

export default function NavbarUserSection() {
  const { user, isLoading, isAuthenticated, isHydrated } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    const token = authStorage.getAccessToken();

    if (token) {
      try {
        // 백엔드 로그아웃 API 호출 (토큰 블랙리스트 + DB 무효화 + 쿠키 삭제)
        const response = await logout(token);
        console.log(response.data.message); // "로그아웃 되었습니다."

        // 원하는 경우 사용자에게 메시지 표시
        // alert(response.data.message);
        // 또는 토스트 라이브러리 사용
      } catch (error) {
        console.error('Logout API failed:', error);
        // API 실패해도 로컬 토큰은 삭제
      }
    }

    // 로컬 토큰 삭제 + BroadcastChannel로 다른 탭에 알림
    authStorage.clearToken();
    router.push('/');
  };

  // Hydration이 완료되지 않았거나 로딩 중일 때는 일관된 UI 표시
  if (!isHydrated || isLoading) {
    return (
      <>
        <Link href={'/login'}>
          <NavbarButton>로그인/회원가입</NavbarButton>
        </Link>
      </>
    );
  }

  if (isAuthenticated) {
    return (
      <>
        <NavbarButton onClick={handleLogout}>로그아웃</NavbarButton>
      </>
    );
  }

  return (
    <>
      <Link href={'/login'}>
        <NavbarButton>로그인/회원가입</NavbarButton>
      </Link>
    </>
  );
}
