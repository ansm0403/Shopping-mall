'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const selectVariants = cva(
  [
    'block w-full rounded-md border bg-white text-secondary-900 transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    'disabled:cursor-not-allowed disabled:bg-secondary-50 disabled:text-secondary-500',
    // 네이티브 화살표 제거 후 커스텀 화살표 여백 확보
    'appearance-none bg-no-repeat bg-right pr-9',
  ],
  {
    variants: {
      selectSize: {
        sm: 'h-8 pl-3 text-sm',
        md: 'h-10 pl-3 text-sm',
        lg: 'h-12 pl-4 text-base',
      },
      state: {
        default: 'border-secondary-300 focus:border-primary-600 focus:ring-primary-600/20',
        error:   'border-red-500 focus:border-red-500 focus:ring-red-500/20',
        success: 'border-green-500 focus:border-green-500 focus:ring-green-500/20',
      },
    },
    defaultVariants: {
      selectSize: 'md',
      state: 'default',
    },
  }
);

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof selectVariants> {
  label?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  options?: SelectOption[];
}

export function Select({
  className,
  selectSize,
  state,
  label,
  error,
  hint,
  placeholder,
  options,
  id,
  children,
  ...props
}: SelectProps) {
  const resolvedState = error ? 'error' : state;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-secondary-700">
          {label}
        </label>
      )}

      {/* 커스텀 화살표 아이콘을 relative wrapper로 처리 */}
      <div className="relative">
        <select
          id={id}
          className={twMerge(
            clsx(selectVariants({ selectSize, state: resolvedState }), className)
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        {/* 커스텀 드롭다운 화살표 */}
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <svg
            className="h-4 w-4 text-secondary-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-secondary-500">{hint}</p>}
    </div>
  );
}
