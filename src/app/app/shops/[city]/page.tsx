import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassBadge } from '@/components/ui/glass-badge';
import { getShops } from '@/backend/services/shop-service';
import { getPaginationParams } from '@/utils/pagination';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ city: string }>;
  searchParams: Promise<{ page?: string }>;
}

function decodeCity(slug: string): string {
  return decodeURIComponent(slug).replace(/-/g, ' ').trim();
}

function titleCase(s: string): string {
  return s
    .split(' ')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city } = await params;
  const display = titleCase(decodeCity(city));
  return {
    title: `Tattoo shops in ${display} — AETCH`,
    description: `Browse verified tattoo shops in ${display}. Bookings, portfolios, reviews.`,
    openGraph: {
      title: `Tattoo shops in ${display}`,
      description: `Discover the best tattoo studios in ${display} on AETCH.`,
    },
    alternates: { canonical: `/app/shops/${city}` },
  };
}

export default async function CityShopsPage({ params, searchParams }: PageProps) {
  const { city: rawCity } = await params;
  const sp = await searchParams;
  const cityName = decodeCity(rawCity);
  if (!cityName) notFound();

  const pagination = getPaginationParams(Number(sp.page ?? 1) || 1, 24);
  const { shops, pagination: meta } = await getShops(pagination, { city: cityName });

  // jsonld for seo
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Tattoo shops in ${titleCase(cityName)}`,
    numberOfItems: meta.total,
    itemListElement: shops.slice(0, 20).map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'TattooParlor',
        name: s.name,
        address: s.address ?? undefined,
        url: `/app/shop/${s.slug}`,
      },
    })),
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 space-y-6">
      <script
        type="application/ld+json"
        // safe: serialized by us, no user input flows to literal HTML
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex items-baseline gap-3">
        <h1 className="text-h2 text-foreground">
          Tattoo shops in {titleCase(cityName)}
        </h1>
        <GlassBadge variant="primary">{meta.total} shops</GlassBadge>
      </div>

      {shops.length === 0 ? (
        <GlassCard padding="lg" className="text-center text-muted">
          No shops listed in {titleCase(cityName)} yet.
        </GlassCard>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shops.map((s) => (
            <li key={s.id}>
              <Link href={`/app/shop/${s.slug}`}>
                <GlassCard padding="md" className="hover:bg-white/15 transition-colors">
                  <h2 className="text-lg text-foreground">{s.name}</h2>
                  <p className="text-sm text-muted mt-1">
                    {s.city}
                    {s.state ? `, ${s.state}` : ''}
                  </p>
                  <div className="text-xs text-muted mt-3">
                    {s._count.bookings} bookings · {s._count.reviews} reviews
                  </div>
                </GlassCard>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
