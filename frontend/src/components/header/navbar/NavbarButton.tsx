import { ButtonHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

type NavbarButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

export function NavbarButton({ className, children, ...props }: NavbarButtonProps) {
  return (
    <button
      className={twMerge(
        'px-4 py-2 font-medium bg-transparent border-0 cursor-pointer whitespace-nowrap hover:bg-gray-100',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
