import { cn } from '@/utils/cn';

interface GlassBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
}

const variantClasses = {
  default: 'glass text-foreground/80',
  primary: 'bg-primary/15 text-primary border border-primary/20',
  success: 'bg-pastel-mint/30 text-emerald-700 border border-pastel-mint/40 dark:text-pastel-mint',
  warning: 'bg-pastel-peach/30 text-amber-700 border border-pastel-peach/40 dark:text-pastel-peach',
  danger: 'bg-pastel-coral/30 text-red-700 border border-pastel-coral/40 dark:text-pastel-coral',
} as const;

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
} as const;

export function GlassBadge({
  variant = 'default',
  size = 'sm',
  className,
  children,
  ...props
}: GlassBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
