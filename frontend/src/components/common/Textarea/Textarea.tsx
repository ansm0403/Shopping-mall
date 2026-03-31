'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { useRef, useCallback } from 'react';
import { twMerge } from 'tailwind-merge';

const textareaVariants = cva(
  [
    'block w-full rounded-md border bg-white text-secondary-900 placeholder:text-secondary-400 transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    'disabled:cursor-not-allowed disabled:bg-secondary-50 disabled:text-secondary-500',
    'resize-y',
  ],
  {
    variants: {
      textareaSize: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-3 py-2 text-sm',
        lg: 'px-4 py-3 text-base',
      },
      state: {
        default: 'border-secondary-300 focus:border-primary-600 focus:ring-primary-600/20',
        error:   'border-red-500 focus:border-red-500 focus:ring-red-500/20',
        success: 'border-green-500 focus:border-green-500 focus:ring-green-500/20',
      },
    },
    defaultVariants: {
      textareaSize: 'md',
      state: 'default',
    },
  }
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  label?: string;
  error?: string;
  hint?: string;
  /** 내용에 따라 높이를 자동 조절합니다 */
  autoResize?: boolean;
}

export function Textarea({
  className,
  textareaSize,
  state,
  label,
  error,
  hint,
  autoResize = false,
  id,
  onChange,
  ...props
}: TextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const resolvedState = error ? 'error' : state;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize && ref.current) {
        // 높이를 auto로 초기화 후 scrollHeight로 재설정해야 줄어드는 케이스도 처리됨
        ref.current.style.height = 'auto';
        ref.current.style.height = `${ref.current.scrollHeight}px`;
      }
      onChange?.(e);
    },
    [autoResize, onChange]
  );

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-secondary-700">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        className={twMerge(
          clsx(
            textareaVariants({ textareaSize, state: resolvedState }),
            autoResize && 'resize-none overflow-hidden',
            className
          )
        )}
        onChange={handleChange}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-secondary-500">{hint}</p>}
    </div>
  );
}
