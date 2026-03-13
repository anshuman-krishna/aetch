'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassInput } from '@/components/ui/glass-input';
import { GlassTextarea } from '@/components/ui/glass-textarea';
import { GlassAvatar } from '@/components/ui/glass-avatar';
import { FormError } from '@/components/forms/form-error';
import { cn } from '@/utils/cn';
import { BODY_PLACEMENTS, PLACEMENT_LABELS } from '@/lib/validations';

const SIZES = [
  { value: 'SMALL', label: 'Small (< 3")' },
  { value: 'MEDIUM', label: 'Medium (3-6")' },
  { value: 'LARGE', label: 'Large (6-12")' },
  { value: 'EXTRA_LARGE', label: 'Extra Large (12"+)' },
] as const;

interface ArtistOption {
  id: string;
  displayName: string;
  image: string | null;
}

interface ShopBookingFormProps {
  shopId: string;
  shopSlug: string;
  artists: ArtistOption[];
}

export function ShopBookingForm({ shopId, shopSlug, artists }: ShopBookingFormProps) {
  const router = useRouter();
  const [artistId, setArtistId] = useState('');
  const [tattooIdea, setTattooIdea] = useState('');
  const [date, setDate] = useState('');
  const [placement, setPlacement] = useState('');
  const [size, setSize] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!artistId) {
      setError('Please select an artist.');
      return;
    }
    if (!tattooIdea.trim() || tattooIdea.trim().length < 10) {
      setError('Describe your tattoo idea (at least 10 characters).');
      return;
    }
    if (!date) {
      setError('Please select a preferred date.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistId,
          shopId,
          tattooIdea: tattooIdea.trim(),
          date: new Date(date).toISOString(),
          placement: placement || undefined,
          size: size || undefined,
          description: description.trim() || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Booking failed.');
        return;
      }

      router.push(`/shop/${shopSlug}?booked=true`);
    } catch {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <FormError message={error} />}

      {/* artist selection */}
      <GlassCard variant="subtle" padding="md">
        <label className="text-sm font-medium text-foreground/80 mb-3 block">Select Artist</label>
        <div className="grid gap-2 sm:grid-cols-2">
          {artists.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setArtistId(a.id)}
              className={cn(
                'flex items-center gap-3 rounded-xl p-3 transition-all duration-200',
                artistId === a.id
                  ? 'bg-primary/20 border border-primary/40 ring-1 ring-primary/20'
                  : 'glass hover:bg-white/15',
              )}
            >
              <GlassAvatar src={a.image} alt={a.displayName} size="sm" />
              <span className="text-sm font-medium text-foreground">{a.displayName}</span>
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard variant="subtle" padding="md" className="space-y-4">
        <GlassTextarea
          label="Tattoo Idea"
          value={tattooIdea}
          onChange={(e) => setTattooIdea(e.target.value)}
          placeholder="Describe your tattoo idea in detail..."
          rows={4}
          required
          maxLength={2000}
        />
        <GlassInput
          label="Preferred Date"
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          min={new Date().toISOString().slice(0, 16)}
        />
      </GlassCard>

      {/* size */}
      <GlassCard variant="subtle" padding="md">
        <label className="text-sm font-medium text-foreground/80 mb-2 block">Size</label>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setSize(size === s.value ? '' : s.value)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200',
                size === s.value
                  ? 'bg-primary/90 text-white border border-primary-light/30'
                  : 'glass hover:bg-white/20 text-foreground/80',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* placement */}
      <GlassCard variant="subtle" padding="md">
        <label className="text-sm font-medium text-foreground/80 mb-2 block">Body Placement</label>
        <div className="flex flex-wrap gap-2">
          {BODY_PLACEMENTS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlacement(placement === p ? '' : p)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200',
                placement === p
                  ? 'bg-primary/90 text-white border border-primary-light/30'
                  : 'glass hover:bg-white/20 text-foreground/80',
              )}
            >
              {PLACEMENT_LABELS[p]}
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard variant="subtle" padding="md">
        <GlassTextarea
          label="Additional Notes"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Any extra details — budget range, reference images, etc."
          rows={3}
          maxLength={2000}
        />
      </GlassCard>

      <GlassButton
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        loading={loading}
      >
        Submit Booking Request
      </GlassButton>
    </form>
  );
}
