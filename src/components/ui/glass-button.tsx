'use client';

import { cn } from '@/utils/cn';
import { forwardRef } from 'react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variantClasses = {
  default: 'glass hover:bg-white/20 active:bg-white/25 text-foreground',
  primary:
    'bg-primary/90 hover:bg-primary text-white backdrop-blur-md border border-primary-light/30',
  secondary:
    'bg-pastel-lavender/20 hover:bg-pastel-lavender/30 text-foreground backdrop-blur-md border border-pastel-lavender/30',
  ghost: 'hover:bg-white/10 text-foreground border-transparent',
  danger: 'bg-danger/90 hover:bg-danger text-white backdrop-blur-md border border-danger/30',
} as const;

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3 text-base rounded-xl',
} as const;

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  (
    { variant = 'default', size = 'md', loading = false, className, children, disabled, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {loading && (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              className="opacity-25"
            />
            <path
              d="M12 2a10 10 0 0 1 10 10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              className="opacity-75"
            />
          </svg>
        )}
        {children}
      </button>
    );
  },
);

GlassButton.displayName = 'GlassButton';
