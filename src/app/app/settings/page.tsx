'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassInput } from '@/components/ui/glass-input';
import { GlassTextarea } from '@/components/ui/glass-textarea';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassAvatar } from '@/components/ui/glass-avatar';
import { PageContainer } from '@/components/layouts/page-container';
import { FormError } from '@/components/forms/form-error';

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    username: '',
    bio: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setForm({
        name: session.user.name ?? '',
        username: session.user.username ?? '',
        bio: '',
      });
    }
  }, [session]);

  if (!session?.user) {
    router.push('/login?callbackUrl=/app/settings');
    return null;
  }

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name || undefined,
          username: form.username || undefined,
          bio: form.bio || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Update failed');
        return;
      }
      setSuccess('Profile updated');
      router.refresh();
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        setSuccess('Avatar updated');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? 'Upload failed');
      }
    } catch {
      setError('Upload failed');
    } finally {
      setAvatarUploading(false);
    }
  };

  return (
    <PageContainer size="sm" animate={false}>
      <div className="py-8 sm:py-12">
        <h1 className="text-h2 text-foreground mb-8">Settings</h1>

        {error && <FormError message={error} className="mb-4" />}
        {success && <div className="mb-4 rounded-xl glass p-3 text-sm text-success">{success}</div>}

        {/* avatar */}
        <GlassCard variant="strong" padding="lg" className="mb-6">
          <h2 className="text-h4 text-foreground mb-4">Profile Photo</h2>
          <div className="flex items-center gap-4">
            <GlassAvatar src={session.user.image} alt={session.user.name ?? ''} size="lg" />
            <div>
              <label className="cursor-pointer inline-flex rounded-xl glass px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-white/15">
                {avatarUploading ? 'Uploading...' : 'Change photo'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={avatarUploading}
                />
              </label>
              <p className="mt-1 text-xs text-muted">JPG, PNG, or WebP. Max 2MB.</p>
            </div>
          </div>
        </GlassCard>

        {/* profile info */}
        <GlassCard variant="strong" padding="lg">
          <h2 className="text-h4 text-foreground mb-4">Profile Info</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <GlassInput
              label="Name"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Your name"
            />
            <GlassInput
              label="Username"
              value={form.username}
              onChange={(e) =>
                update('username', e.target.value.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase())
              }
              placeholder="username"
            />
            <GlassTextarea
              label="Bio"
              value={form.bio}
              onChange={(e) => update('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
            />
            <GlassButton variant="primary" type="submit" loading={loading} className="w-full">
              Save changes
            </GlassButton>
          </form>
        </GlassCard>
      </div>
    </PageContainer>
  );
}
