'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassBadge } from '@/components/ui/glass-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { CalendarDays, Check, X, Clock } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface BookingUser {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
}

interface BookingItem {
  id: string;
  date: string;
  status: string;
  tattooIdea: string | null;
  placement: string | null;
  size: string | null;
  description: string | null;
  artistNotes: string | null;
  price: number | null;
  user: BookingUser;
}

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'primary'> = {
  PENDING: 'warning',
  CONFIRMED: 'success',
  CANCELLED: 'default',
  COMPLETED: 'primary',
  NO_SHOW: 'default',
};

const statusFilters = ['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] as const;

export default function BookingsPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') ?? 'ALL';
  const [filter, setFilter] = useState(initialStatus);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== 'ALL') params.set('status', filter);
    const res = await fetch(`/api/bookings/artist?${params}`);
    const data = await res.json();
    setBookings(data.bookings ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchBookings();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h2 text-foreground">Bookings</h1>
        <p className="mt-1 text-muted">Manage your booking requests</p>
      </div>

      {/* status filter */}
      <div className="flex gap-2 flex-wrap">
        {statusFilters.map((s) => (
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
            <div key={i} className="h-28 rounded-2xl glass animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No bookings"
          description="Bookings from clients will appear here."
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
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                  {b.tattooIdea && (
                    <p className="text-sm text-muted line-clamp-2">{b.tattooIdea}</p>
                  )}
                  {b.placement && (
                    <p className="text-xs text-muted">Placement: {b.placement}</p>
                  )}
                </div>

                {b.status === 'PENDING' && (
                  <div className="flex gap-2 shrink-0">
                    <GlassButton
                      variant="primary"
                      size="sm"
                      onClick={() => updateStatus(b.id, 'CONFIRMED')}
                    >
                      <Check className="h-4 w-4" /> Accept
                    </GlassButton>
                    <GlassButton
                      variant="ghost"
                      size="sm"
                      onClick={() => updateStatus(b.id, 'CANCELLED')}
                    >
                      <X className="h-4 w-4" /> Decline
                    </GlassButton>
                  </div>
                )}

                {b.status === 'CONFIRMED' && (
                  <GlassButton
                    variant="primary"
                    size="sm"
                    onClick={() => updateStatus(b.id, 'COMPLETED')}
                  >
                    <Check className="h-4 w-4" /> Complete
                  </GlassButton>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
