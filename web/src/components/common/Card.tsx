import React from 'react';
import { cn } from '@utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = true,
  padding = 'md',
  className = '',
  ...props
}) => {
  return (
    <div
      className={cn(
        "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md transition-all duration-300 overflow-hidden",
        hoverable && "hover:shadow-hover hover:-translate-y-1 hover:border-neutral-300 dark:hover:border-neutral-700",
        padding === 'none' && "p-0",
        padding === 'sm' && "p-3",
        padding === 'md' && "p-5",
        padding === 'lg' && "p-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
