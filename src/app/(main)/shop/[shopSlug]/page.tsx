import { notFound } from 'next/navigation';
import { getShopBySlug } from '@/backend/services/shop-service';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassAvatar } from '@/components/ui/glass-avatar';
import { GlassBadge } from '@/components/ui/glass-badge';
import { PageContainer } from '@/components/layouts/page-container';

interface Props {
  params: Promise<{ shopSlug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { shopSlug } = await params;
  const shop = await getShopBySlug(shopSlug);
  if (!shop) return { title: 'Shop not found' };
  return {
    title: shop.name,
    description: shop.description ?? `${shop.name} — tattoo shop on AETCH`,
  };
}

export default async function ShopProfilePage({ params }: Props) {
  const { shopSlug } = await params;
  const shop = await getShopBySlug(shopSlug);
  if (!shop) notFound();

  const location = [shop.city, shop.country].filter(Boolean).join(', ');

  return (
    <PageContainer animate={false}>
      <div className="py-12">
        <GlassCard variant="strong" padding="lg">
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left sm:gap-6">
            <GlassAvatar
              src={shop.image}
              alt={shop.name}
              fallback={shop.name.slice(0, 2).toUpperCase()}
              size="xl"
            />
            <div className="mt-4 sm:mt-0">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-h3 text-foreground">{shop.name}</h1>
                {shop.verified && <GlassBadge variant="success">Verified</GlassBadge>}
              </div>
              {location && <p className="mt-1 text-sm text-muted">{location}</p>}
              {shop.description && (
                <p className="mt-3 text-sm text-muted max-w-lg">{shop.description}</p>
              )}

              <div className="mt-4 flex gap-6">
                <div>
                  <span className="font-bold text-foreground">{shop.artists.length}</span>
                  <span className="ml-1 text-xs text-muted">Artists</span>
                </div>
                <div>
                  <span className="font-bold text-foreground">{shop._count.reviews}</span>
                  <span className="ml-1 text-xs text-muted">Reviews</span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Artists */}
        {shop.artists.length > 0 && (
          <GlassCard padding="md" className="mt-6">
            <h2 className="text-h4 text-foreground mb-4">Artists</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {shop.artists.map((artist) => (
                <div key={artist.id} className="flex items-center gap-3 rounded-xl glass-subtle p-3">
                  <GlassAvatar src={artist.user.image} alt={artist.displayName} size="md" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{artist.displayName}</p>
                    {artist.specialties.length > 0 && (
                      <p className="text-xs text-muted">{artist.specialties.slice(0, 3).join(', ')}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}
      </div>
    </PageContainer>
  );
}
