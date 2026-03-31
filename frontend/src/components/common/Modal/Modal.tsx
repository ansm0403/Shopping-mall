'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { twMerge } from 'tailwind-merge';

// ─── 패널 크기 variant ───────────────────────────────────────────────────────
const modalPanelVariants = cva(
  [
    'relative bg-white rounded-xl shadow-xl w-full',
    'flex flex-col max-h-[90vh]',
    'animate-[fadeInScale_0.15s_ease-out]',
  ],
  {
    variants: {
      size: {
        sm:   'max-w-sm',
        md:   'max-w-md',
        lg:   'max-w-lg',
        xl:   'max-w-xl',
        full: 'max-w-3xl',
      },
    },
    defaultVariants: { size: 'md' },
  }
);

// ─── 타입 ────────────────────────────────────────────────────────────────────
export interface ModalProps extends VariantProps<typeof modalPanelVariants> {
  isOpen: boolean;
  onClose: () => void;
  /** 배경(Overlay) 클릭으로 닫을지 여부 (기본 true) */
  closeOnOverlayClick?: boolean;
  /** 모달 제목 */
  title?: string;
  children: React.ReactNode;
  className?: string;
}

// ─── 컴포넌트 ────────────────────────────────────────────────────────────────
export function Modal({
  isOpen,
  onClose,
  closeOnOverlayClick = true,
  title,
  size,
  children,
  className,
}: ModalProps) {
  // SSR 환경에서 포털 마운트를 클라이언트에서만 실행
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ESC 키 닫기 + 배경 스크롤 잠금
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Overlay 클릭 시 패널 외부인지 확인 후 닫기
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <div
        className={twMerge(
          clsx(modalPanelVariants({ size }), className)
        )}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          aria-label="닫기"
          className="absolute top-4 right-4 rounded-md p-1 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>

        {/* 헤더 (title이 있을 때만 렌더) */}
        {title && (
          <div className="px-6 pt-5 pb-4 border-b border-secondary-100">
            <h2 className="text-lg font-semibold text-secondary-900 pr-8">{title}</h2>
          </div>
        )}

        {/* 본문 영역 — 스크롤 */}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}

// ─── 편의 서브컴포넌트 (Modal 내부 영역 구분용) ──────────────────────────────
export function ModalFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={twMerge(
        'px-6 py-4 border-t border-secondary-100 flex items-center justify-end gap-3',
        className
      )}
    >
      {children}
    </div>
  );
}
