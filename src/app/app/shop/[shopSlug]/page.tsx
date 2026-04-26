import { notFound } from 'next/navigation';
import { getShopBySlug, getShopTattoos } from '@/backend/services/shop-service';
import { getPaginationParams } from '@/utils/pagination';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassAvatar } from '@/components/ui/glass-avatar';
import { GlassBadge } from '@/components/ui/glass-badge';
import { GlassButton } from '@/components/ui/glass-button';
import { PageContainer } from '@/components/layouts/page-container';
import { TattooGrid } from '@/components/features/gallery/tattoo-grid';
import { Pagination } from '@/components/ui/pagination';
import { ShopArtistsList } from '@/components/features/shops/shop-artists-list';
import { CalendarPlus, MapPin, Globe, Phone, Mail } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ shopSlug: string }>;
  searchParams: Promise<{ page?: string }>;
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

export default async function ShopProfilePage({ params, searchParams }: Props) {
  const { shopSlug } = await params;
  const shop = await getShopBySlug(shopSlug);
  if (!shop) notFound();

  const resolvedSearch = await searchParams;
  const page = Number(resolvedSearch.page ?? '1');
  const pagination = getPaginationParams(page, 12);
  const portfolio = await getShopTattoos(shop.id, pagination);

  const location = [shop.city, shop.state, shop.country].filter(Boolean).join(', ');

  return (
    <PageContainer animate={false}>
      <div className="py-12 space-y-8">
        {/* shop header */}
        <GlassCard variant="strong" padding="lg">
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left sm:gap-6">
            <GlassAvatar
              src={shop.image}
              alt={shop.name}
              fallback={shop.name.slice(0, 2).toUpperCase()}
              size="xl"
            />
            <div className="mt-4 sm:mt-0 flex-1">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-h3 text-foreground">{shop.name}</h1>
                {shop.verified && <GlassBadge variant="success">Verified</GlassBadge>}
              </div>

              {location && (
                <p className="flex items-center gap-1 mt-1 text-sm text-muted justify-center sm:justify-start">
                  <MapPin className="h-3.5 w-3.5" />
                  {location}
                </p>
              )}

              {shop.description && (
                <p className="mt-3 text-sm text-muted max-w-lg">{shop.description}</p>
              )}

              <div className="mt-4 flex gap-6 justify-center sm:justify-start">
                <div>
                  <span className="font-bold text-foreground">{shop.shopArtists.length}</span>
                  <span className="ml-1 text-xs text-muted">Artists</span>
                </div>
                <div>
                  <span className="font-bold text-foreground">{shop._count.reviews}</span>
                  <span className="ml-1 text-xs text-muted">Reviews</span>
                </div>
              </div>

              {/* contact links */}
              <div className="mt-4 flex flex-wrap gap-3 justify-center sm:justify-start">
                {shop.website && (
                  <a
                    href={shop.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Globe className="h-3.5 w-3.5" /> Website
                  </a>
                )}
                {shop.phone && (
                  <a
                    href={`tel:${shop.phone}`}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Phone className="h-3.5 w-3.5" /> {shop.phone}
                  </a>
                )}
                {shop.email && (
                  <a
                    href={`mailto:${shop.email}`}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Mail className="h-3.5 w-3.5" /> {shop.email}
                  </a>
                )}
              </div>

              {/* book cta */}
              {shop.shopArtists.length > 0 && (
                <div className="mt-5">
                  <Link href={`/app/book/shop/${shop.slug}`}>
                    <GlassButton variant="primary" size="md">
                      <CalendarPlus className="h-4 w-4" /> Book at this Shop
                    </GlassButton>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </GlassCard>

        {/* artists */}
        {shop.shopArtists.length > 0 && (
          <div>
            <h2 className="text-h4 text-foreground mb-4">Artists</h2>
            <ShopArtistsList artists={shop.shopArtists} />
          </div>
        )}

        {/* portfolio */}
        {portfolio.tattoos.length > 0 && (
          <div>
            <h2 className="text-h4 text-foreground mb-4">Portfolio</h2>
            <TattooGrid tattoos={portfolio.tattoos} />
            {portfolio.pagination.totalPages > 1 && (
              <div className="mt-6">
                <Pagination pagination={portfolio.pagination} basePath={`/app/shop/${shop.slug}`} />
              </div>
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
