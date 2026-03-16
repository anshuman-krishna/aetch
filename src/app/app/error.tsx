'use client';

import { useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app-error]', error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <GlassCard variant="strong" padding="lg" className="text-center">
        <h2 className="text-h2 text-foreground mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-muted mb-6">
          An error occurred while loading this page. Please try again.
        </p>
        <button
          onClick={reset}
          className="rounded-xl bg-primary/90 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary"
        >
          Try again
        </button>
      </GlassCard>
    </div>
  );
}
