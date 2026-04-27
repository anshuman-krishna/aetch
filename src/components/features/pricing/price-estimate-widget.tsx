'use client';

import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';

interface Estimate {
  low: number;
  high: number;
  midpoint: number;
  estimatedHours: number;
  hourlyRate: number;
  currency: string;
}

interface Props {
  artistId?: string;
  hourlyRate?: number;
  size?: string;
  colorType?: string;
  placement?: string;
  complexity?: string;
  styles?: string[];
  className?: string;
}

export function PriceEstimateWidget({
  artistId,
  hourlyRate,
  size,
  colorType,
  placement,
  complexity,
  styles,
  className,
}: Props) {
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stylesKey = styles?.join(',');

  useEffect(() => {
    if (!size) {
      setEstimate(null);
      return;
    }
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/price-estimate', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            artistId,
            hourlyRate,
            size,
            colorType,
            placement,
            complexity,
            styles: stylesKey ? stylesKey.split(',') : undefined,
          }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(data?.error ?? 'Failed to estimate');
        setEstimate(data.estimate);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [artistId, hourlyRate, size, colorType, placement, complexity, stylesKey]);

  if (!size) return null;

  return (
    <GlassCard variant="subtle" padding="md" className={className}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground/80">Estimated price</p>
        {loading && <span className="text-xs text-muted">Calculating…</span>}
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      {estimate && (
        <>
          <p className="mt-2 text-h4 text-foreground">
            ${estimate.low} – ${estimate.high}
          </p>
          <p className="text-xs text-muted">
            ~{estimate.estimatedHours}h at ${estimate.hourlyRate}/hr · midpoint $
            {estimate.midpoint}
          </p>
          <p className="mt-1 text-[10px] text-muted/80">
            Estimate only. Final quote comes from your artist after review.
          </p>
        </>
      )}
    </GlassCard>
  );
}
