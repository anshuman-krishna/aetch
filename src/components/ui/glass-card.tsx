import { cn } from '@/utils/cn';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'strong';
  padding?: 'sm' | 'md' | 'lg';
}

const variantClasses = {
  default: 'glass',
  subtle: 'glass-subtle',
  strong: 'glass-strong',
} as const;

const paddingClasses = {
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
} as const;

export function GlassCard({
  variant = 'default',
  padding = 'md',
  className,
  children,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn('rounded-2xl', variantClasses[variant], paddingClasses[padding], className)}
      {...props}
    >
      {children}
    </div>
  );
}
