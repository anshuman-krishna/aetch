'use client';

import { cn } from '@/utils/cn';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GlassTooltipProps {
  content: string;
  side?: 'top' | 'bottom';
  children: React.ReactNode;
  className?: string;
}

export function GlassTooltip({ content, side = 'top', children, className }: GlassTooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: side === 'top' ? 4 : -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: side === 'top' ? 4 : -4 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap',
              'rounded-lg glass-strong px-3 py-1.5 text-xs font-medium text-foreground shadow-lg',
              side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
            )}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
