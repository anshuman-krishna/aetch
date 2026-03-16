import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getShopBySlug } from '@/backend/services/shop-service';
import { PageContainer } from '@/components/layouts/page-container';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassAvatar } from '@/components/ui/glass-avatar';
import { GlassBadge } from '@/components/ui/glass-badge';
import { ShopBookingForm } from '@/components/features/booking/shop-booking-form';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ shopSlug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { shopSlug } = await params;
  const shop = await getShopBySlug(shopSlug);
  if (!shop) return { title: 'Shop not found' };
  return {
    title: `Book at ${shop.name} — AETCH`,
    description: `Request a booking at ${shop.name} on AETCH.`,
  };
}

export default async function BookShopPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/book');

  const { shopSlug } = await params;
  const shop = await getShopBySlug(shopSlug);
  if (!shop) notFound();

  const artists = shop.shopArtists.map((sa) => ({
    id: sa.artist.id,
    displayName: sa.artist.displayName,
    image: sa.artist.user.image,
  }));

  if (artists.length === 0) notFound();

  const location = [shop.city, shop.country].filter(Boolean).join(', ');

  return (
    <PageContainer size="sm" animate={false}>
      <div className="py-8 sm:py-12 space-y-6">
        {/* shop header */}
        <GlassCard variant="strong" padding="md">
          <div className="flex items-center gap-4">
            <GlassAvatar
              src={shop.image}
              alt={shop.name}
              fallback={shop.name.slice(0, 2).toUpperCase()}
              size="lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-h4 text-foreground">{shop.name}</h1>
                {shop.verified && <GlassBadge variant="success" size="sm">Verified</GlassBadge>}
              </div>
              {location && (
                <p className="text-xs text-muted mt-0.5">{location}</p>
              )}
            </div>
          </div>
        </GlassCard>

        <div>
          <h2 className="text-h3 text-foreground mb-2">Book via Shop</h2>
          <p className="text-muted text-sm">
            Choose an artist and fill out details below.
          </p>
        </div>

        <ShopBookingForm
          shopId={shop.id}
          shopSlug={shopSlug}
          artists={artists}
        />
      </div>
    </PageContainer>
  );
}
