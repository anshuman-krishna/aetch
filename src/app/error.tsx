'use client';

import { useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[root-error]', error);
    fetch('/api/_error', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        digest: error.digest,
        stack: error.stack,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
      }),
      keepalive: true,
    }).catch(() => {});
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <GlassCard variant="strong" padding="lg" className="text-center">
        <h2 className="text-h2 text-foreground mb-2">Something went wrong</h2>
        <p className="text-sm text-muted mb-6">
          An unexpected error occurred. Please try again or refresh the page.
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
