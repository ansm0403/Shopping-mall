import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';
import { NavbarButton } from './NavbarButton';
import React from 'react';

export default function NavbarUserSection() {
  const { user, isLoading, isAuthenticated, isHydrated } = useAuth();

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
        <div>로그인 완료</div>
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
