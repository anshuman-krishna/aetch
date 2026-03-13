'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassBadge } from '@/components/ui/glass-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { CalendarDays, Clock } from 'lucide-react';

interface BookingItem {
  id: string;
  date: string;
  status: string;
  tattooIdea: string | null;
  user: { name: string | null; username: string | null };
  artist: { displayName: string; slug: string };
}

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'primary'> = {
  PENDING: 'warning',
  CONFIRMED: 'success',
  CANCELLED: 'default',
  COMPLETED: 'primary',
};

const filters = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED'] as const;

export default function ShopBookingsPage() {
  const [filter, setFilter] = useState('ALL');
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [shopId, setShopId] = useState('');

  useEffect(() => {
    fetch('/api/shops/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.shop) setShopId(d.shop.id);
      });
  }, []);

  useEffect(() => {
    if (!shopId) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== 'ALL') params.set('status', filter);
    fetch(`/api/shops/${shopId}/bookings?${params}`)
      .then((r) => r.json())
      .then((d) => setBookings(d.bookings ?? []))
      .finally(() => setLoading(false));
  }, [shopId, filter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h2 text-foreground">Shop Bookings</h1>
        <p className="mt-1 text-muted">All bookings across your shop</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {filters.map((s) => (
          <GlassButton
            key={s}
            variant={filter === s ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter(s)}
          >
            {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
          </GlassButton>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl glass animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No bookings"
          description="Bookings will appear here when clients book."
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <GlassCard key={b.id} padding="md">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">
                      {b.user.name ?? b.user.username ?? 'Client'}
                    </p>
                    <GlassBadge variant={statusVariant[b.status] ?? 'default'} size="sm">
                      {b.status}
                    </GlassBadge>
                  </div>
                  <p className="text-xs text-muted">
                    <Clock className="inline h-3 w-3 mr-1" />
                    {new Date(b.date).toLocaleDateString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric',
                      hour: 'numeric', minute: '2-digit',
                    })}
                  </p>
                  <p className="text-xs text-muted">
                    Artist: {b.artist.displayName}
                  </p>
                  {b.tattooIdea && (
                    <p className="text-sm text-muted line-clamp-2">{b.tattooIdea}</p>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
