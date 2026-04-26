'use client';

import { useState } from 'react';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassInput } from '@/components/ui/glass-input';
import { GlassTextarea } from '@/components/ui/glass-textarea';

interface Generation {
  id: string;
  imageUrl?: string | null;
  status: string;
}

export function CoverupForm() {
  const [existing, setExisting] = useState('');
  const [subject, setSubject] = useState('');
  const [style, setStyle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Generation | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch('/api/coverup', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          existingDescription: existing,
          desiredSubject: subject || undefined,
          desiredStyle: style || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Generation failed');
      setResult(data.generation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <GlassTextarea
        label="Describe the existing tattoo"
        value={existing}
        onChange={(e) => setExisting(e.target.value)}
        placeholder="Faded black tribal band on forearm"
        required
      />
      <GlassInput
        label="What do you want it covered with?"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Snake wrapped around a dagger"
      />
      <GlassInput
        label="Preferred style (optional)"
        value={style}
        onChange={(e) => setStyle(e.target.value)}
        placeholder="JAPANESE"
      />
      <GlassButton type="submit" variant="primary" loading={loading}>
        Generate coverup
      </GlassButton>

      {error && (
        <GlassCard padding="md" className="border border-red-400/40 text-sm text-red-400">
          {error}
        </GlassCard>
      )}

      {result?.imageUrl && (
        <GlassCard padding="md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={result.imageUrl} alt="Generated coverup design" className="w-full rounded-xl" />
        </GlassCard>
      )}
    </form>
  );
}
