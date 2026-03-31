'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const spinnerVariants = cva(
  'animate-spin rounded-full border-solid border-current border-r-transparent',
  {
    variants: {
      size: {
        sm: 'h-4 w-4 border-2',
        md: 'h-6 w-6 border-2',
        lg: 'h-10 w-10 border-[3px]',
        xl: 'h-16 w-16 border-4',
      },
      color: {
        primary:   'text-primary-600',
        secondary: 'text-secondary-500',
        white:     'text-white',
        current:   'text-current',
      },
    },
    defaultVariants: {
      size: 'md',
      color: 'primary',
    },
  }
);

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string;
}

export function Spinner({ className, size, color, label = '로딩 중...', ...props }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={twMerge(clsx(spinnerVariants({ size, color }), className))}
      {...props}
    />
  );
}

// 화면 전체를 덮는 풀스크린 스피너
export function FullPageSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
      <Spinner size="xl" />
    </div>
  );
}
