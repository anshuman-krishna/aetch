import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getArtistBySlug } from '@/backend/services/artist-service';
import { PageContainer } from '@/components/layouts/page-container';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassAvatar } from '@/components/ui/glass-avatar';
import { GlassBadge } from '@/components/ui/glass-badge';
import { BookingForm } from '@/components/features/booking/booking-form';
import { MessageArtistButton } from '@/components/features/messaging/message-artist-button';

interface Props {
  params: Promise<{ artistSlug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { artistSlug } = await params;
  const artist = await getArtistBySlug(artistSlug);
  if (!artist) return { title: 'Artist not found' };
  return {
    title: `Book ${artist.displayName} — AETCH`,
    description: `Request a booking with ${artist.displayName} on AETCH.`,
  };
}

export default async function BookArtistPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/book');

  const { artistSlug } = await params;
  const artist = await getArtistBySlug(artistSlug);
  if (!artist) notFound();

  return (
    <PageContainer size="sm" animate={false}>
      <div className="py-8 sm:py-12 space-y-6">
        {/* artist header */}
        <GlassCard variant="strong" padding="md">
          <div className="flex items-center gap-4">
            <GlassAvatar src={artist.user.image} alt={artist.displayName} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-h4 text-foreground">{artist.displayName}</h1>
                {artist.verified && (
                  <GlassBadge variant="success" size="sm">
                    Verified
                  </GlassBadge>
                )}
              </div>
              {artist.location && <p className="text-xs text-muted mt-0.5">{artist.location}</p>}
              {artist.hourlyRate && (
                <p className="text-sm text-foreground mt-1">${Number(artist.hourlyRate)}/hr</p>
              )}
            </div>
            <div className="ml-auto">
              <MessageArtistButton artistUserId={artist.userId} />
            </div>
          </div>
        </GlassCard>

        <div>
          <h2 className="text-h3 text-foreground mb-2">Request a Booking</h2>
          <p className="text-muted text-sm">
            Fill out the details below and the artist will respond to your request.
          </p>
        </div>

        <BookingForm artistId={artist.id} artistSlug={artistSlug} />
      </div>
    </PageContainer>
  );
}
