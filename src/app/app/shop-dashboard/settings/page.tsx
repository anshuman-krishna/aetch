'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassInput } from '@/components/ui/glass-input';
import { GlassTextarea } from '@/components/ui/glass-textarea';
import { useToast } from '@/components/ui/glass-toast';
import { Save } from 'lucide-react';

interface ShopForm {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  email: string;
  website: string;
}

export default function ShopSettingsPage() {
  const { toast } = useToast();
  const [form, setForm] = useState<ShopForm>({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    country: '',
    phone: '',
    email: '',
    website: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/shops/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.shop) {
          setForm({
            name: d.shop.name ?? '',
            description: d.shop.description ?? '',
            address: d.shop.address ?? '',
            city: d.shop.city ?? '',
            state: d.shop.state ?? '',
            country: d.shop.country ?? '',
            phone: d.shop.phone ?? '',
            email: d.shop.email ?? '',
            website: d.shop.website ?? '',
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const update = (field: keyof ShopForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body: Record<string, string | undefined> = {};
      for (const [k, v] of Object.entries(form)) {
        if (v) body[k] = v;
      }
      const res = await fetch('/api/shops/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      toast(res.ok ? 'Saved' : 'Failed to save', res.ok ? 'success' : 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-2xl glass animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h2 text-foreground">Shop Settings</h1>
        <p className="mt-1 text-muted">Update your shop profile</p>
      </div>

      <GlassCard variant="subtle" padding="md" className="space-y-4">
        <GlassInput
          label="Shop Name"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
        />
        <GlassTextarea
          label="Description"
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          rows={3}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <GlassInput
            label="City"
            value={form.city}
            onChange={(e) => update('city', e.target.value)}
          />
          <GlassInput
            label="State"
            value={form.state}
            onChange={(e) => update('state', e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <GlassInput
            label="Country"
            value={form.country}
            onChange={(e) => update('country', e.target.value)}
          />
          <GlassInput
            label="Address"
            value={form.address}
            onChange={(e) => update('address', e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <GlassInput
            label="Phone"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
          />
          <GlassInput
            label="Email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
          />
          <GlassInput
            label="Website"
            value={form.website}
            onChange={(e) => update('website', e.target.value)}
          />
        </div>

        <div className="flex justify-end pt-2">
          <GlassButton variant="primary" size="md" onClick={handleSave} loading={saving}>
            <Save className="h-4 w-4" /> Save Changes
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  );
}
