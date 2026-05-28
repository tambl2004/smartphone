import React from 'react';
import { cn } from '@utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function Button({ className, variant = 'primary', size = 'md', fullWidth = false, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center rounded-md font-semibold outline-none transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'bg-black text-white shadow-sm hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200',
        variant === 'secondary' && 'border border-neutral-300 bg-white text-black shadow-sm hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800',
        variant === 'ghost' && 'bg-transparent text-black hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-800',
        variant === 'danger' && 'bg-red-600 text-white shadow-sm hover:bg-red-700',
        size === 'sm' && 'h-9 px-4 text-sm',
        size === 'md' && 'h-11 px-6 text-base',
        size === 'lg' && 'h-14 px-8 text-lg',
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    />
  );
}

