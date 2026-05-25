import React from 'react';
import { cn } from '@utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth = false, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-semibold rounded-md transition-all duration-200 outline-none disabled:opacity-50 disabled:cursor-not-allowed",
          // Variants
          variant === 'primary' && "bg-black text-white hover:bg-neutral-800 shadow-sm dark:bg-white dark:text-black dark:hover:bg-neutral-200",
          variant === 'secondary' && "bg-white text-black border border-neutral-300 hover:bg-neutral-100 shadow-sm dark:bg-neutral-900 dark:text-white dark:border-neutral-700 dark:hover:bg-neutral-800",
          variant === 'ghost' && "bg-transparent text-black hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-800",
          variant === 'danger' && "bg-red-600 text-white hover:bg-red-700 shadow-sm",
          // Sizes
          size === 'sm' && "h-9 px-4 text-sm",
          size === 'md' && "h-11 px-6 text-base",
          size === 'lg' && "h-14 px-8 text-lg",
          // Full width
          fullWidth && "w-full",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
