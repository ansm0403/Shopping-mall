import Image from 'next/image';

/**
 * 스플래시 화면 중앙에 표시할 콘텐츠
 *
 * 나중에 텍스트 + 글자별 애니메이션으로 교체하려면
 * 이 컴포넌트 안만 수정하면 됩니다.
 * SplashScreen.tsx (애니메이션 로직)는 건드릴 필요 없습니다.
 */
export default function SplashContent() {
  return (
    <Image
      src="/images/logo/shopping_logo_white.png"
      alt="Shopping Mall"
      width={200}
      height={180}
      priority
    />
  );
}
