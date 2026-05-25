import React, { useId } from 'react';
import { cn } from '@utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, fullWidth = true, id, ...props }, ref) => {
    const defaultId = useId();
    const inputId = id || defaultId;

    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full", className)}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "flex h-11 w-full rounded-md border bg-white px-3 py-2 text-sm text-neutral-900 transition-colors",
            "placeholder:text-neutral-500",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-400 dark:focus-visible:ring-white",
            error ? "border-red-500 focus-visible:ring-red-500" : "border-neutral-300",
            className
          )}
          {...props}
        />
        {error && <span className="text-sm font-medium text-red-500">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
