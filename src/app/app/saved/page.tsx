import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getSavedTattoos } from '@/backend/services/tattoo-service';
import { getPaginationParams } from '@/utils/pagination';
import { PageContainer } from '@/components/layouts/page-container';
import { TattooGrid } from '@/components/features/gallery/tattoo-grid';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { GlassButton } from '@/components/ui/glass-button';
import { Bookmark } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Saved Tattoos — AETCH',
  description: 'Your saved tattoo collection.',
};

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function SavedTattoosPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/app/saved');

  const resolvedParams = await searchParams;
  const page = Number(resolvedParams.page ?? '1');
  const pagination = getPaginationParams(page, 20);
  const result = await getSavedTattoos(session.user.id, pagination);

  return (
    <PageContainer size="xl" animate={false}>
      <div className="py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-h2 text-foreground">Saved Tattoos</h1>
          <p className="mt-2 text-muted">
            Your bookmarked tattoo inspiration.
          </p>
        </div>

        {result.tattoos.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="No saved tattoos yet"
            description="Browse the gallery and save tattoos you love."
            action={
              <Link href="/app/gallery">
                <GlassButton variant="primary" size="md">Explore Gallery</GlassButton>
              </Link>
            }
          />
        ) : (
          <>
            <TattooGrid tattoos={result.tattoos} />
            <Pagination pagination={result.pagination} basePath="/app/saved" />
          </>
        )}
      </div>
    </PageContainer>
  );
}
