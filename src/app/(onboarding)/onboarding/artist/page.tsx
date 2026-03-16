'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassInput } from '@/components/ui/glass-input';
import { GlassTextarea } from '@/components/ui/glass-textarea';
import { FormError } from '@/components/forms/form-error';
import { slugify } from '@/utils/slugify';
import { cn } from '@/utils/cn';

const specialtyOptions = [
  'Traditional', 'Neo-traditional', 'Japanese', 'Blackwork', 'Fine Line',
  'Minimalist', 'Realism', 'Tribal', 'Watercolor', 'Geometric',
  'Abstract', 'Dotwork', 'Biomechanical', 'Chicano',
];

export default function ArtistOnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: '',
    displayName: '',
    bio: '',
    location: '',
    hourlyRate: '',
  });
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSpecialty = (s: string) => {
    setSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.displayName) {
      setError('Username and artist name are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const slug = slugify(form.displayName);

      const res = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'artist',
          username: form.username.toLowerCase(),
          displayName: form.displayName,
          slug,
          bio: form.bio,
          specialties,
          location: form.location,
          hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong');
        return;
      }
      router.push('/app/gallery');
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard variant="strong" padding="lg">
      <h1 className="text-h3 text-foreground">Set up your artist profile</h1>
      <p className="mt-1 text-sm text-muted">Showcase your work to the world</p>

      {error && <FormError message={error} className="mt-4" />}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <GlassInput
            label="Username"
            placeholder="your_username"
            value={form.username}
            onChange={(e) => update('username', e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
            required
          />
          <GlassInput
            label="Artist name"
            placeholder="Your display name"
            value={form.displayName}
            onChange={(e) => update('displayName', e.target.value)}
            required
          />
        </div>

        <GlassTextarea
          label="Bio"
          placeholder="Tell us about your tattooing journey..."
          value={form.bio}
          onChange={(e) => update('bio', e.target.value)}
          rows={3}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <GlassInput
            label="Location"
            placeholder="City, Country"
            value={form.location}
            onChange={(e) => update('location', e.target.value)}
          />
          <GlassInput
            label="Hourly rate (USD)"
            type="number"
            placeholder="150"
            value={form.hourlyRate}
            onChange={(e) => update('hourlyRate', e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground/80">Specialties</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {specialtyOptions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSpecialty(s)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                  specialties.includes(s)
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'glass text-muted hover:text-foreground',
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <GlassButton variant="primary" size="lg" className="w-full" type="submit" loading={loading}>
          Create artist profile
        </GlassButton>
      </form>
    </GlassCard>
  );
}
