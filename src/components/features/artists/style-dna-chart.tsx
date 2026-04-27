'use client';

import { useMemo } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassBadge } from '@/components/ui/glass-badge';
import { STYLE_LABELS } from '@/lib/validations';

interface StyleDnaChartProps {
  weights: Record<string, number>;
  sampleSize: number;
}

// horizontal bars + top-3 badge summary. SVG kept simple for accessibility.
export function StyleDnaChart({ weights, sampleSize }: StyleDnaChartProps) {
  const sorted = useMemo(
    () =>
      Object.entries(weights)
        .filter(([, v]) => v > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8),
    [weights],
  );

  if (sorted.length === 0) {
    return null;
  }

  const top = sorted.slice(0, 3);

  return (
    <GlassCard padding="md" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-h4 text-foreground">Style DNA</h2>
        <span className="text-xs text-muted">{sampleSize} tattoos analyzed</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {top.map(([style, weight]) => (
          <GlassBadge key={style} variant="primary">
            {STYLE_LABELS[style] ?? style} · {Math.round(weight * 100)}%
          </GlassBadge>
        ))}
      </div>

      <div className="space-y-2">
        {sorted.map(([style, weight]) => {
          const pct = Math.round(weight * 100);
          return (
            <div key={style} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-foreground/80">{STYLE_LABELS[style] ?? style}</span>
                <span className="text-muted">{pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-primary/80 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
