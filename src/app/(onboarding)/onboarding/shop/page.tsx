'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassInput } from '@/components/ui/glass-input';
import { GlassTextarea } from '@/components/ui/glass-textarea';
import { FormError } from '@/components/forms/form-error';
import { slugify } from '@/utils/slugify';

export default function ShopOnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: '',
    shopName: '',
    description: '',
    city: '',
    address: '',
    country: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.shopName) {
      setError('Username and shop name are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const slug = slugify(form.shopName);

      const res = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'shop',
          username: form.username.toLowerCase(),
          shopName: form.shopName,
          slug,
          description: form.description,
          city: form.city,
          address: form.address,
          country: form.country,
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
      <h1 className="text-h3 text-foreground">Set up your shop</h1>
      <p className="mt-1 text-sm text-muted">Create your tattoo shop profile</p>

      {error && <FormError message={error} className="mt-4" />}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <GlassInput
          label="Username"
          placeholder="your_username"
          value={form.username}
          onChange={(e) => update('username', e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
          required
        />

        <GlassInput
          label="Shop name"
          placeholder="Your tattoo shop"
          value={form.shopName}
          onChange={(e) => update('shopName', e.target.value)}
          required
        />

        <GlassTextarea
          label="Description"
          placeholder="Tell people about your shop..."
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          rows={3}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <GlassInput
            label="City"
            placeholder="Los Angeles"
            value={form.city}
            onChange={(e) => update('city', e.target.value)}
          />
          <GlassInput
            label="Country"
            placeholder="United States"
            value={form.country}
            onChange={(e) => update('country', e.target.value)}
          />
        </div>

        <GlassInput
          label="Address"
          placeholder="123 Ink Street"
          value={form.address}
          onChange={(e) => update('address', e.target.value)}
        />

        <GlassButton variant="primary" size="lg" className="w-full" type="submit" loading={loading}>
          Create shop profile
        </GlassButton>
      </form>
    </GlassCard>
  );
}
