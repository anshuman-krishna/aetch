'use client';

import { useMemo, useState } from 'react';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassInput } from '@/components/ui/glass-input';
import { cn } from '@/utils/cn';
import { TATTOO_STYLES, STYLE_LABELS, BODY_PLACEMENTS, PLACEMENT_LABELS } from '@/lib/validations';

type AgeYears = 1 | 5 | 10;
const AGES: AgeYears[] = [1, 5, 10];

interface AgedFilter {
  ageYears: AgeYears;
  blurPx: number;
  brightness: number;
  contrast: number;
  saturate: number;
  sepia: number;
  notes: string[];
}

interface Result {
  imageUrl: string;
  timeline: AgedFilter[];
}

const LINE_OPTIONS = ['fine', 'medium', 'bold'] as const;
const COLOR_OPTIONS = ['BLACK_AND_GREY', 'MIXED', 'COLOR'] as const;

export function LongevitySimulator() {
  const [imageUrl, setImageUrl] = useState('');
  const [lineThickness, setLineThickness] = useState<(typeof LINE_OPTIONS)[number]>('medium');
  const [colorPalette, setColorPalette] =
    useState<(typeof COLOR_OPTIONS)[number]>('BLACK_AND_GREY');
  const [placement, setPlacement] = useState('');
  const [style, setStyle] = useState('');
  const [age, setAge] = useState<AgeYears>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const current = useMemo(() => result?.timeline.find((t) => t.ageYears === age), [result, age]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch('/api/longevity', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          lineThickness,
          colorPalette,
          placement: placement || undefined,
          style: style || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Simulation failed');
      setResult({ imageUrl: data.imageUrl, timeline: data.timeline });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="space-y-4">
        <GlassInput
          label="Tattoo image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
          required
        />

        <GlassCard variant="subtle" padding="md">
          <p className="text-sm font-medium text-foreground/80 mb-2">Line thickness</p>
          <div className="flex gap-2">
            {LINE_OPTIONS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLineThickness(l)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium transition',
                  lineThickness === l ? 'bg-primary/90 text-white' : 'glass text-foreground/80',
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard variant="subtle" padding="md">
          <p className="text-sm font-medium text-foreground/80 mb-2">Color palette</p>
          <div className="flex gap-2 flex-wrap">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColorPalette(c)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium transition',
                  colorPalette === c ? 'bg-primary/90 text-white' : 'glass text-foreground/80',
                )}
              >
                {c.replace('_', ' ').toLowerCase()}
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard variant="subtle" padding="md">
          <p className="text-sm font-medium text-foreground/80 mb-2">Placement</p>
          <select
            value={placement}
            onChange={(e) => setPlacement(e.target.value)}
            className="w-full glass rounded-xl px-4 py-2.5 text-sm bg-transparent text-foreground"
          >
            <option value="">Any</option>
            {BODY_PLACEMENTS.map((p) => (
              <option key={p} value={p}>
                {PLACEMENT_LABELS[p]}
              </option>
            ))}
          </select>
        </GlassCard>

        <GlassCard variant="subtle" padding="md">
          <p className="text-sm font-medium text-foreground/80 mb-2">Style</p>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full glass rounded-xl px-4 py-2.5 text-sm bg-transparent text-foreground"
          >
            <option value="">Any</option>
            {TATTOO_STYLES.map((s) => (
              <option key={s} value={s}>
                {STYLE_LABELS[s]}
              </option>
            ))}
          </select>
        </GlassCard>

        <GlassButton type="submit" variant="primary" size="lg" loading={loading} className="w-full">
          Simulate aging
        </GlassButton>
      </form>

      {error && (
        <GlassCard padding="md" className="border border-red-400/40 text-sm text-red-400">
          {error}
        </GlassCard>
      )}

      {result && current && (
        <GlassCard padding="md" className="space-y-4">
          <div className="flex items-center gap-2">
            {AGES.map((y) => (
              <button
                key={y}
                onClick={() => setAge(y)}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition',
                  age === y ? 'bg-primary/90 text-white' : 'glass text-foreground/80',
                )}
              >
                {y} year{y > 1 ? 's' : ''}
              </button>
            ))}
          </div>

          <div className="rounded-xl overflow-hidden border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.imageUrl}
              alt={`Tattoo at year ${current.ageYears}`}
              className="w-full block transition-all"
              style={{
                filter: `blur(${current.blurPx}px) brightness(${current.brightness}) contrast(${current.contrast}) saturate(${current.saturate}) sepia(${current.sepia})`,
              }}
            />
          </div>

          {current.notes.length > 0 && (
            <ul className="text-xs text-muted space-y-1 list-disc pl-4">
              {current.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          )}
          <p className="text-[10px] text-muted/80">
            v0 simulation — visual approximation only. Real aging depends on individual skin, sun
            exposure, and aftercare.
          </p>
        </GlassCard>
      )}
    </div>
  );
}
