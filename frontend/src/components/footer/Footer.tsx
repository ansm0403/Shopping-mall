'use client';

import Link from 'next/link';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: '고객 서비스',
      links: [
        { label: '공지사항', href: '#' },
        { label: '자주 묻는 질문', href: '#' },
        { label: '1:1 문의', href: '#' },
        { label: '반품/교환', href: '#' },
      ],
    },
    {
      title: '회사 정보',
      links: [
        { label: '회사 소개', href: '#' },
        { label: '채용 정보', href: '#' },
        { label: '제휴 문의', href: '#' },
        { label: '사업자 정보', href: '#' },
      ],
    },
    {
      title: '정책',
      links: [
        { label: '이용약관', href: '#' },
        { label: '개인정보처리방침', href: '#' },
        { label: '쿠키 정책', href: '#' },
        { label: '이용 조건', href: '#' },
      ],
    },
  ];

  return (
    <footer className="bg-gradient-to-b from-secondary-600 to-secondary-900 text-white mt-20">
      {/* 메인 콘텐츠 */}
      <MaxWidthContainer>
        <div className="py-16">
          {/* 상단 섹션 - 회사명 및 소개 */}
          <div className="mb-12 pb-12 border-b border-secondary-700">
            {/* <h3 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-primary-500">
              ShoppingMall
            </h3> */}
            <p className="text-secondary-300 text-sm max-w-md leading-relaxed">
              최고의 상품과 서비스로 여러분의 쇼핑 경험을 향상시키고 있습니다.
              언제든지 편리하게 쇼핑하세요.
            </p>
          </div>

          {/* 링크 섹션 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {footerSections.map((section) => (
              <div key={section.title}>
                <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-secondary-300 hover:text-primary-400 text-sm transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* SNS 섹션 */}
          <div className="mb-12 pb-12 border-b border-secondary-700">
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              팔로우하기
            </h4>
            <div className="flex gap-4">
              {['Facebook', 'Instagram', 'Twitter', 'YouTube'].map((social) => (
                <Link
                  key={social}
                  href="#"
                  className="w-10 h-10 rounded-full bg-primary-600 hover:bg-primary-500 flex items-center justify-center transition-all duration-200 hover:scale-110"
                  aria-label={social}
                >
                  <span className="text-white text-lg">
                    {social === 'Facebook' && '𝕱'}
                    {social === 'Instagram' && '📷'}
                    {social === 'Twitter' && '𝕿'}
                    {social === 'YouTube' && '▶'}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* 하단 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">
                연락처
              </h4>
              <div className="space-y-2 text-secondary-300 text-sm">
                <p> 고객센터: 1234-5678</p>
                <p> 이메일: support@shoppingmall.com</p>
                <p> 주소: 서울시 멋있는구 맛있는리 123-4</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">
                운영시간
              </h4>
              <div className="space-y-2 text-secondary-300 text-sm">
                <p>평일: AM 10:00 ~ PM 05:00</p>
                <p>토요일: AM 10:00 ~ PM 02:00</p>
                <p>일요일 및 공휴일 휴무</p>
              </div>
            </div>
          </div>
        </div>
      </MaxWidthContainer>

      {/* 하단 바 */}
      <div className="border-t border-secondary-700 bg-secondary-950/50">
        <MaxWidthContainer>
          <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-secondary-400 text-xs md:text-sm">
            <p>© {currentYear} ShoppingMall. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-primary-400 transition-colors">
                개인정보처리방침
              </Link>
              <Link href="#" className="hover:text-primary-400 transition-colors">
                이용약관
              </Link>
              <Link href="#" className="hover:text-primary-400 transition-colors">
                사이트맵
              </Link>
            </div>
          </div>
        </MaxWidthContainer>
      </div>
    </footer>
  );
}
