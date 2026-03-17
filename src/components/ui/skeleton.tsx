import { cn } from '@/utils/cn';

// reusable skeleton primitive
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-xl bg-white/10', className)} {...props} />;
}
