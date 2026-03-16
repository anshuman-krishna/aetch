import { notFound } from 'next/navigation';
import { getArtistBySlug } from '@/backend/services/artist-service';
import { getArtistTattoos } from '@/backend/services/tattoo-service';
import { getPaginationParams } from '@/utils/pagination';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassAvatar } from '@/components/ui/glass-avatar';
import { GlassBadge } from '@/components/ui/glass-badge';
import { GlassButton } from '@/components/ui/glass-button';
import { PageContainer } from '@/components/layouts/page-container';
import { TattooGrid } from '@/components/features/gallery/tattoo-grid';
import { Pagination } from '@/components/ui/pagination';
import Link from 'next/link';

interface Props {
  params: Promise<{ artistSlug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { artistSlug } = await params;
  const artist = await getArtistBySlug(artistSlug);
  if (!artist) return { title: 'Artist not found' };
  return {
    title: artist.displayName,
    description: artist.bio ?? `${artist.displayName} — tattoo artist on AETCH`,
  };
}

export default async function ArtistProfilePage({ params, searchParams }: Props) {
  const { artistSlug } = await params;
  const resolvedSearchParams = await searchParams;
  const artist = await getArtistBySlug(artistSlug);
  if (!artist) notFound();

  const page = Number(resolvedSearchParams.page ?? '1');
  const pagination = getPaginationParams(page, 12);
  const portfolio = await getArtistTattoos(artist.id, pagination);

  return (
    <PageContainer animate={false}>
      <div className="py-12">
        <GlassCard variant="strong" padding="lg">
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left sm:gap-6">
            <GlassAvatar
              src={artist.user.image}
              alt={artist.displayName}
              size="xl"
            />
            <div className="mt-4 sm:mt-0">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-h3 text-foreground">{artist.displayName}</h1>
                {artist.verified && <GlassBadge variant="success">Verified</GlassBadge>}
              </div>
              {artist.user.username && (
                <p className="text-sm text-muted">@{artist.user.username}</p>
              )}
              {artist.location && (
                <p className="mt-1 text-sm text-muted">{artist.location}</p>
              )}
              {artist.bio && (
                <p className="mt-3 text-sm text-muted max-w-lg">{artist.bio}</p>
              )}

              {/* actions */}
              <div className="mt-4">
                <Link href={`/app/book/${artistSlug}`}>
                  <GlassButton variant="primary" size="md">Book Now</GlassButton>
                </Link>
              </div>

              {/* stats */}
              <div className="mt-4 flex gap-6">
                <div>
                  <span className="font-bold text-foreground">{artist._count.tattoos}</span>
                  <span className="ml-1 text-xs text-muted">Tattoos</span>
                </div>
                <div>
                  <span className="font-bold text-foreground">{artist._count.reviews}</span>
                  <span className="ml-1 text-xs text-muted">Reviews</span>
                </div>
                {artist.hourlyRate && (
                  <div>
                    <span className="font-bold text-foreground">
                      ${Number(artist.hourlyRate)}
                    </span>
                    <span className="ml-1 text-xs text-muted">/hr</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Specialties */}
        {artist.specialties.length > 0 && (
          <GlassCard padding="md" className="mt-6">
            <h2 className="text-h4 text-foreground mb-3">Specialties</h2>
            <div className="flex flex-wrap gap-2">
              {artist.specialties.map((s) => (
                <GlassBadge key={s} variant="primary">{s}</GlassBadge>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Portfolio */}
        <div className="mt-8">
          <h2 className="text-h3 text-foreground mb-6">Portfolio</h2>

          {portfolio.tattoos.length > 0 ? (
            <>
              <TattooGrid tattoos={portfolio.tattoos} />
              <Pagination pagination={portfolio.pagination} basePath={`/app/artist/${artistSlug}`} />
            </>
          ) : (
            <GlassCard padding="lg" className="text-center">
              <p className="text-muted">No tattoos uploaded yet.</p>
            </GlassCard>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
