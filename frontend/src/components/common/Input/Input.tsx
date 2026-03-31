'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const inputVariants = cva(
  'block w-full rounded-md border bg-white text-secondary-900 placeholder:text-secondary-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-secondary-50 disabled:text-secondary-500',
  {
    variants: {
      inputSize: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-3 text-sm',
        lg: 'h-12 px-4 text-base',
      },
      state: {
        default: 'border-secondary-300 focus:border-primary-600 focus:ring-primary-600/20',
        error:   'border-red-500 focus:border-red-500 focus:ring-red-500/20',
        success: 'border-green-500 focus:border-green-500 focus:ring-green-500/20',
      },
    },
    defaultVariants: {
      inputSize: 'md',
      state: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({
  className,
  inputSize,
  state,
  label,
  error,
  hint,
  id,
  ...props
}: InputProps) {
  const resolvedState = error ? 'error' : state;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-secondary-700"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={twMerge(
          clsx(inputVariants({ inputSize, state: resolvedState }), className)
        )}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
      {hint && !error && (
        <p className="text-xs text-secondary-500">{hint}</p>
      )}
    </div>
  );
}
