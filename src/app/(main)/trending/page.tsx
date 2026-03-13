import { getTrendingTattoos } from '@/backend/services/tattoo-service';
import { PageContainer } from '@/components/layouts/page-container';
import { TattooGrid } from '@/components/features/gallery/tattoo-grid';
import { GlassButton } from '@/components/ui/glass-button';
import { Flame } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Trending Tattoos — AETCH',
  description: 'Discover the hottest tattoos trending right now.',
};

export default async function TrendingPage() {
  const tattoos = await getTrendingTattoos(30);

  return (
    <PageContainer size="xl" animate={false}>
      <div className="py-8 sm:py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-pastel-coral/20 p-2">
              <Flame className="h-5 w-5 text-pastel-coral" />
            </div>
            <h1 className="text-h2 text-foreground">Trending</h1>
          </div>
          <p className="text-muted">
            The most popular tattoos from the past 7 days.
          </p>
        </div>

        {tattoos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h3 className="text-h4 text-foreground">No trending tattoos yet</h3>
            <p className="mt-1 text-sm text-muted max-w-sm">
              Check back soon — tattoos are being uploaded and liked every day.
            </p>
            <Link href="/gallery" className="mt-4">
              <GlassButton variant="primary" size="md">
                Browse Gallery
              </GlassButton>
            </Link>
          </div>
        ) : (
          <TattooGrid tattoos={tattoos} />
        )}
      </div>
    </PageContainer>
  );
}
