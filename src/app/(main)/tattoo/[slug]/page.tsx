import { notFound } from 'next/navigation';
import { getTattooBySlug, isLikedByUser, isSavedByUser, getRelatedTattoos, incrementViewCount } from '@/backend/services/tattoo-service';
import { auth } from '@/lib/auth';
import { PageContainer } from '@/components/layouts/page-container';
import { TattooDetailView } from '@/components/features/gallery/tattoo-detail-view';
import { TattooGrid } from '@/components/features/gallery/tattoo-grid';
import type { TattooStyle } from '@prisma/client';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const tattoo = await getTattooBySlug(slug);
  if (!tattoo) return { title: 'Tattoo not found' };
  return {
    title: `${tattoo.title} — AETCH`,
    description: tattoo.description ?? `${tattoo.title} by ${tattoo.artist.displayName}`,
    openGraph: {
      title: tattoo.title,
      description: tattoo.description ?? `Tattoo by ${tattoo.artist.displayName}`,
      images: [{ url: tattoo.imageUrl }],
    },
  };
}

export default async function TattooDetailPage({ params }: Props) {
  const { slug } = await params;
  const tattoo = await getTattooBySlug(slug);
  if (!tattoo) notFound();

  // Track view (non-blocking)
  incrementViewCount(tattoo.id).catch(() => {});

  // Check user interactions
  const session = await auth();
  let liked = false;
  let saved = false;
  if (session?.user) {
    [liked, saved] = await Promise.all([
      isLikedByUser(session.user.id, tattoo.id),
      isSavedByUser(session.user.id, tattoo.id),
    ]);
  }

  // Related tattoos
  const related = await getRelatedTattoos(tattoo.id, tattoo.styles as TattooStyle[], 6);

  return (
    <PageContainer size="xl" animate={false}>
      <div className="py-8 sm:py-12">
        <TattooDetailView
          tattoo={{
            id: tattoo.id,
            title: tattoo.title,
            slug: tattoo.slug,
            description: tattoo.description,
            imageUrl: tattoo.imageUrl,
            blurDataUrl: tattoo.blurDataUrl,
            styles: tattoo.styles,
            bodyPlacement: tattoo.bodyPlacement,
            colorType: tattoo.colorType,
            likesCount: tattoo.likesCount,
            viewsCount: tattoo.viewsCount,
            artist: tattoo.artist,
          }}
          initialLiked={liked}
          initialSaved={saved}
        />

        {/* Related Tattoos */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-h3 text-foreground mb-6">Related Tattoos</h2>
            <TattooGrid tattoos={related} />
          </div>
        )}
      </div>
    </PageContainer>
  );
}
