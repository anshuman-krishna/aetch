import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getShopByOwnerId, getShopTattoos } from '@/backend/services/shop-service';
import { getPaginationParams } from '@/utils/pagination';
import { TattooGrid } from '@/components/features/gallery/tattoo-grid';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { Images } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Shop Portfolio — AETCH',
};

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function ShopPortfolioPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const shop = await getShopByOwnerId(session.user.id);
  if (!shop) redirect('/');

  const resolvedParams = await searchParams;
  const page = Number(resolvedParams.page ?? '1');
  const pagination = getPaginationParams(page, 12);
  const result = await getShopTattoos(shop.id, pagination);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h2 text-foreground">Shop Portfolio</h1>
        <p className="mt-1 text-muted">Tattoos from all your shop artists</p>
      </div>

      {result.tattoos.length === 0 ? (
        <EmptyState
          icon={Images}
          title="No tattoos yet"
          description="Add artists to your shop — their work will appear here."
        />
      ) : (
        <>
          <TattooGrid tattoos={result.tattoos} />
          <Pagination pagination={result.pagination} basePath="/shop-dashboard/portfolio" />
        </>
      )}
    </div>
  );
}
