import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getShopByOwnerId, getShopDashboardStats } from '@/backend/services/shop-service';
import { GlassCard } from '@/components/ui/glass-card';
import { Users, CalendarDays, Clock, Star } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Shop Dashboard — AETCH',
};

export default async function ShopDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const shop = await getShopByOwnerId(session.user.id);
  if (!shop) redirect('/');

  const stats = await getShopDashboardStats(shop.id);

  const statCards = [
    { label: 'Artists', value: stats.artistCount, icon: Users, href: '/app/shop-dashboard/artists' },
    { label: 'Bookings', value: stats.bookingCount, icon: CalendarDays, href: '/app/shop-dashboard/bookings' },
    { label: 'Pending', value: stats.pendingCount, icon: Clock, href: '/app/shop-dashboard/bookings' },
    { label: 'Reviews', value: stats.reviewCount, icon: Star, href: '#' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h2 text-foreground">Shop Dashboard</h1>
        <p className="mt-1 text-muted">{shop.name}</p>
      </div>

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

      {/* quick links */}
      <GlassCard variant="subtle" padding="md">
        <h2 className="text-h4 text-foreground mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href={`/app/shop/${shop.slug}`} className="rounded-xl glass px-4 py-2 text-sm text-foreground hover:bg-white/15 transition-colors">
            View public profile
          </Link>
          <Link href="/app/shop-dashboard/artists" className="rounded-xl glass px-4 py-2 text-sm text-foreground hover:bg-white/15 transition-colors">
            Manage artists
          </Link>
          <Link href="/app/shop-dashboard/settings" className="rounded-xl glass px-4 py-2 text-sm text-foreground hover:bg-white/15 transition-colors">
            Edit shop info
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
