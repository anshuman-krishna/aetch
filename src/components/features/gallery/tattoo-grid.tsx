'use client';

import { cn } from '@/utils/cn';
import { TattooCard, type TattooCardData } from './tattoo-card';
import { GlassSkeleton } from '@/components/ui/glass-skeleton';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface TattooGridProps {
  tattoos: TattooCardData[];
  loading?: boolean;
  className?: string;
}

export function TattooGrid({ tattoos, loading = false, className }: TattooGridProps) {
  if (loading) {
    return <TattooGridSkeleton />;
  }

  if (tattoos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full glass-strong p-6 mb-4">
          <svg
            className="h-10 w-10 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
            />
          </svg>
        </div>
        <h3 className="text-h4 text-foreground">No tattoos found</h3>
        <p className="mt-1 text-sm text-muted max-w-sm">
          Try adjusting your filters or check back later for new uploads.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        'columns-2 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4',
        className,
      )}
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {tattoos.map((tattoo, i) => (
        <motion.div key={tattoo.id} variants={staggerItem} className="break-inside-avoid">
          <TattooCard tattoo={tattoo} priority={i < 4} />
        </motion.div>
      ))}
    </motion.div>
  );
}

function TattooGridSkeleton() {
  return (
    <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="break-inside-avoid">
          <GlassSkeleton
            className={cn(
              'w-full rounded-2xl',
              i % 3 === 0 ? 'h-80' : i % 3 === 1 ? 'h-64' : 'h-72',
            )}
          />
          <div className="mt-2.5 space-y-1.5">
            <div className="flex items-center gap-2">
              <GlassSkeleton className="h-6 w-6" rounded="full" />
              <GlassSkeleton className="h-3 w-20" />
            </div>
            <div className="flex gap-1">
              <GlassSkeleton className="h-5 w-14" rounded="full" />
              <GlassSkeleton className="h-5 w-16" rounded="full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
