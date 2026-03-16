'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassInput } from '@/components/ui/glass-input';
import { GlassTextarea } from '@/components/ui/glass-textarea';
import { useToast } from '@/components/ui/glass-toast';
import { Save } from 'lucide-react';

interface ArtistData {
  displayName: string;
  bio: string;
  location: string;
  hourlyRate: string;
  website: string;
  instagram: string;
}

export default function DashboardSettingsPage() {
  const { toast } = useToast();
  const [form, setForm] = useState<ArtistData>({
    displayName: '',
    bio: '',
    location: '',
    hourlyRate: '',
    website: '',
    instagram: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/artists/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.artist) {
          setForm({
            displayName: d.artist.displayName ?? '',
            bio: d.artist.bio ?? '',
            location: d.artist.location ?? '',
            hourlyRate: d.artist.hourlyRate ? String(d.artist.hourlyRate) : '',
            website: d.artist.website ?? '',
            instagram: d.artist.instagram ?? '',
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const update = (field: keyof ArtistData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/artists/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: form.displayName || undefined,
          bio: form.bio || undefined,
          location: form.location || undefined,
          hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : undefined,
          website: form.website || undefined,
          instagram: form.instagram || undefined,
        }),
      });
      if (res.ok) {
        toast('Settings saved', 'success');
      } else {
        toast('Failed to save', 'error');
      }
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
        <h1 className="text-h2 text-foreground">Settings</h1>
        <p className="mt-1 text-muted">Update your artist profile</p>
      </div>

      <GlassCard variant="subtle" padding="md" className="space-y-4">
        <GlassInput
          label="Display Name"
          value={form.displayName}
          onChange={(e) => update('displayName', e.target.value)}
        />
        <GlassTextarea
          label="Bio"
          value={form.bio}
          onChange={(e) => update('bio', e.target.value)}
          rows={3}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <GlassInput
            label="Location"
            value={form.location}
            onChange={(e) => update('location', e.target.value)}
            placeholder="City, Country"
          />
          <GlassInput
            label="Hourly Rate (USD)"
            type="number"
            value={form.hourlyRate}
            onChange={(e) => update('hourlyRate', e.target.value)}
            placeholder="150"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <GlassInput
            label="Website"
            value={form.website}
            onChange={(e) => update('website', e.target.value)}
            placeholder="https://..."
          />
          <GlassInput
            label="Instagram"
            value={form.instagram}
            onChange={(e) => update('instagram', e.target.value)}
            placeholder="your_handle"
          />
        </div>

        <div className="flex justify-end pt-2">
          <GlassButton variant="primary" size="md" onClick={handleSave} loading={saving}>
            <Save className="h-4 w-4" />
            Save Changes
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  );
}
