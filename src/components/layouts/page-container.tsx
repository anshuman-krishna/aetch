'use client';

import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/animations';

interface PageContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  animate?: boolean;
}

const sizeClasses = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
} as const;

export function PageContainer({
  children,
  size = 'lg',
  className,
  animate = true,
}: PageContainerProps) {
  const Wrapper = animate ? motion.div : 'div';
  const motionProps = animate
    ? { variants: pageTransition, initial: 'initial', animate: 'animate', exit: 'exit' }
    : {};

  return (
    <Wrapper
      className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', sizeClasses[size], className)}
      {...motionProps}
    >
      {children}
    </Wrapper>
  );
}
