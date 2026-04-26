'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassInput } from '@/components/ui/glass-input';
import { ShopArtistsList } from '@/components/features/shops/shop-artists-list';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/glass-toast';
import { Users, UserPlus } from 'lucide-react';

export default function ShopArtistsPage() {
  const { toast } = useToast();
  const [shopId, setShopId] = useState('');
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [artistSlug, setArtistSlug] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchData = async () => {
    const res = await fetch('/api/shops/me');
    const data = await res.json();
    if (data.shop) {
      setShopId(data.shop.id);
      const artistRes = await fetch(`/api/shops/${data.shop.id}/artists`);
      const artistData = await artistRes.json();
      setArtists(artistData.artists ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async () => {
    if (!artistSlug.trim() || !shopId) return;
    setAdding(true);

    // resolve artist by slug
    const res = await fetch(`/api/shops/${shopId}/artists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ artistId: artistSlug.trim() }),
    });

    if (res.ok) {
      toast('Artist added', 'success');
      setArtistSlug('');
      fetchData();
    } else {
      const data = await res.json();
      toast(data.error ?? 'Failed to add', 'error');
    }
    setAdding(false);
  };

  const handleRemove = async (artistId: string) => {
    const res = await fetch(`/api/shops/${shopId}/artists?artistId=${artistId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      toast('Artist removed', 'success');
      fetchData();
    } else {
      toast('Failed to remove', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h2 text-foreground">Artists</h1>
        <p className="mt-1 text-muted">Manage your shop artists</p>
      </div>

      {/* add artist */}
      <GlassCard variant="subtle" padding="md">
        <h3 className="text-sm font-semibold text-foreground/80 mb-3">Add Artist</h3>
        <div className="flex gap-3">
          <GlassInput
            value={artistSlug}
            onChange={(e) => setArtistSlug(e.target.value)}
            placeholder="Artist ID"
            className="flex-1"
          />
          <GlassButton variant="primary" size="md" onClick={handleAdd} loading={adding}>
            <UserPlus className="h-4 w-4" />
            Add
          </GlassButton>
        </div>
      </GlassCard>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-2xl glass animate-pulse" />
          ))}
        </div>
      ) : artists.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No artists yet"
          description="Add artists to your shop to get started."
        />
      ) : (
        <ShopArtistsList artists={artists} editable onRemove={handleRemove} />
      )}
    </div>
  );
}
