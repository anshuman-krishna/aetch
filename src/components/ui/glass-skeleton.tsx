import { cn } from '@/utils/cn';

interface GlassSkeletonProps {
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

const roundedClasses = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  full: 'rounded-full',
} as const;

export function GlassSkeleton({ className, rounded = 'md' }: GlassSkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-foreground/5',
        roundedClasses[rounded],
        className,
      )}
    />
  );
}
