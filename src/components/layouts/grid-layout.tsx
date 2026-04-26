import { cn } from '@/utils/cn';

interface GridLayoutProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
} as const;

const gapClasses = {
  sm: 'gap-3',
  md: 'gap-5',
  lg: 'gap-8',
} as const;

export function GridLayout({ children, cols = 3, gap = 'md', className }: GridLayoutProps) {
  return <div className={cn('grid', colClasses[cols], gapClasses[gap], className)}>{children}</div>;
}
