'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ─── Root Card ────────────────────────────────────────────────────────────────
const cardVariants = cva(
  'rounded-xl bg-white flex flex-col overflow-hidden',
  {
    variants: {
      shadow: {
        none: '',
        sm:   'shadow-sm',
        md:   'shadow-md',
        lg:   'shadow-lg',
      },
      border: {
        none:    '',
        default: 'border border-secondary-200',
        primary: 'border border-primary-300',
      },
      /** 클릭 가능한 카드에 hover 효과 적용 */
      hoverable: {
        true: 'transition-shadow cursor-pointer hover:shadow-lg',
      },
      /** 카드 내부 padding 여부 (헤더/콘텐츠/푸터를 직접 조합할 땐 false) */
      padded: {
        true:  'p-5',
        false: '',
      },
    },
    defaultVariants: {
      shadow:    'md',
      border:    'default',
      hoverable: false,
      padded:    false,
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export function Card({
  className,
  shadow,
  border,
  hoverable,
  padded,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={twMerge(
        clsx(cardVariants({ shadow, border, hoverable, padded }), className)
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── CardHeader ───────────────────────────────────────────────────────────────
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 우측 영역 (버튼, 뱃지 등) */
  action?: React.ReactNode;
}

export function CardHeader({ children, action, className, ...props }: CardHeaderProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'flex items-center justify-between gap-4 px-5 py-4 border-b border-secondary-100',
          className
        )
      )}
      {...props}
    >
      <div className="flex-1 min-w-0">{children}</div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ─── CardContent ──────────────────────────────────────────────────────────────
export function CardContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge(clsx('flex-1 px-5 py-4', className))} {...props}>
      {children}
    </div>
  );
}

// ─── CardFooter ───────────────────────────────────────────────────────────────
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 'start' | 'center' | 'end' | 'between' */
  align?: 'start' | 'center' | 'end' | 'between';
}

const footerAlignMap = {
  start:   'justify-start',
  center:  'justify-center',
  end:     'justify-end',
  between: 'justify-between',
} as const;

export function CardFooter({
  children,
  align = 'end',
  className,
  ...props
}: CardFooterProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'flex items-center gap-3 px-5 py-4 border-t border-secondary-100',
          footerAlignMap[align],
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── 상품 카드 전용 이미지 영역 ────────────────────────────────────────────────
export function CardImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div className={twMerge(clsx('w-full overflow-hidden bg-secondary-100', className))}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </div>
  );
}
