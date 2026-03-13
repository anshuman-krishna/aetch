import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { PageContainer } from '@/components/layouts/page-container';
import { ShopDashboardSidebar } from '@/components/features/shops/shop-dashboard-sidebar';

export default async function ShopDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/shop-dashboard');
  }

  if (session.user.role !== 'SHOP_OWNER' && session.user.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <PageContainer size="xl" animate={false}>
      <div className="flex gap-6 py-8">
        <ShopDashboardSidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </PageContainer>
  );
}
