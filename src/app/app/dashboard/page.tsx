import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getArtistByUserId, getArtistDashboardStats } from '@/backend/services/artist-service';
import { getUpcomingBookings } from '@/backend/services/booking-service';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { Images, CalendarDays, Clock, Star } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dashboard — AETCH',
  description: 'Manage your artist profile and bookings.',
};

export default async function DashboardOverviewPage() {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/app/dashboard');

  const artist = await getArtistByUserId(session.user.id);
  if (!artist) redirect('/');

  const [stats, upcoming] = await Promise.all([
    getArtistDashboardStats(artist.id),
    getUpcomingBookings(artist.id),
  ]);

  const statCards = [
    { label: 'Tattoos', value: stats.totalTattoos, icon: Images, href: '/app/dashboard/portfolio' },
    {
      label: 'Bookings',
      value: stats.totalBookings,
      icon: CalendarDays,
      href: '/app/dashboard/bookings',
    },
    {
      label: 'Pending',
      value: stats.pendingBookings,
      icon: Clock,
      href: '/app/dashboard/bookings?status=PENDING',
    },
    { label: 'Reviews', value: stats.totalReviews, icon: Star, href: '#' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h2 text-foreground">Dashboard</h1>
        <p className="mt-1 text-muted">Welcome back, {artist.displayName}</p>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Link key={s.label} href={s.href}>
            <GlassCard padding="md" className="hover:bg-white/15 transition-colors">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/15 p-2">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted">{s.label}</p>
                </div>
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>

      {/* upcoming bookings */}
      <GlassCard variant="subtle" padding="md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h4 text-foreground">Upcoming Bookings</h2>
          <Link href="/app/dashboard/bookings">
            <GlassButton variant="ghost" size="sm">
              View all
            </GlassButton>
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <p className="text-sm text-muted py-4">No upcoming bookings</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-xl glass p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {b.user.name ?? b.user.username ?? 'Client'}
                  </p>
                  <p className="text-xs text-muted">
                    {new Date(b.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <Link href={`/app/dashboard/bookings`}>
                  <GlassButton variant="ghost" size="sm">
                    Details
                  </GlassButton>
                </Link>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
