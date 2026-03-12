'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassInput } from '@/components/ui/glass-input';
import { GlassTextarea } from '@/components/ui/glass-textarea';
import { FormError } from '@/components/forms/form-error';
import { cn } from '@/utils/cn';

const tattooStyles = [
  'Traditional', 'Neo-traditional', 'Japanese', 'Blackwork', 'Fine Line',
  'Minimalist', 'Realism', 'Tribal', 'Watercolor', 'Geometric',
  'Abstract', 'Dotwork',
];

export default function UserOnboardingPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleStyle = (style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'user',
          username: username.toLowerCase(),
          bio,
          favoriteStyles: selectedStyles,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong');
        return;
      }
      router.push('/');
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard variant="strong" padding="lg">
      <h1 className="text-h3 text-foreground">Set up your profile</h1>
      <p className="mt-1 text-sm text-muted">Tell us about yourself</p>

      {error && <FormError message={error} className="mt-4" />}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <GlassInput
          label="Username"
          placeholder="your_username"
          value={username}
          onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
          required
          autoComplete="username"
        />

        <GlassTextarea
          label="Bio"
          placeholder="Tell us about your tattoo interests..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
        />

        <div>
          <label className="text-sm font-medium text-foreground/80">Favorite tattoo styles</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {tattooStyles.map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => toggleStyle(style)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                  selectedStyles.includes(style)
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'glass text-muted hover:text-foreground',
                )}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <GlassButton variant="primary" size="lg" className="w-full" type="submit" loading={loading}>
          Complete setup
        </GlassButton>
      </form>
    </GlassCard>
  );
}
