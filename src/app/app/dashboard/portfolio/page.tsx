import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getArtistByUserId } from '@/backend/services/artist-service';
import { getArtistTattoos } from '@/backend/services/tattoo-service';
import { getPaginationParams } from '@/utils/pagination';
import { TattooGrid } from '@/components/features/gallery/tattoo-grid';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { GlassButton } from '@/components/ui/glass-button';
import { Images } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Portfolio — AETCH Dashboard',
};

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function PortfolioPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const artist = await getArtistByUserId(session.user.id);
  if (!artist) redirect('/');

  const resolvedParams = await searchParams;
  const page = Number(resolvedParams.page ?? '1');
  const pagination = getPaginationParams(page, 12);
  const result = await getArtistTattoos(artist.id, pagination);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2 text-foreground">Portfolio</h1>
          <p className="mt-1 text-muted">Manage your uploaded tattoos</p>
        </div>
        <Link href="/app/dashboard/upload">
          <GlassButton variant="primary" size="md">Upload Tattoo</GlassButton>
        </Link>
      </div>

      {result.tattoos.length === 0 ? (
        <EmptyState
          icon={Images}
          title="No tattoos yet"
          description="Upload your first tattoo to start building your portfolio."
          action={
            <Link href="/app/dashboard/upload">
              <GlassButton variant="primary" size="md">Upload Tattoo</GlassButton>
            </Link>
          }
        />
      ) : (
        <>
          <TattooGrid tattoos={result.tattoos} />
          <Pagination pagination={result.pagination} basePath="/app/dashboard/portfolio" />
        </>
      )}
    </div>
  );
}
