import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { PageContainer } from '@/components/layouts/page-container';
import { DashboardSidebar } from '@/components/features/dashboard/dashboard-sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/app/dashboard');
  }

  const roles = session.user.roles ?? [];
  if (!roles.includes('ARTIST') && !roles.includes('ADMIN')) {
    redirect('/');
  }

  return (
    <PageContainer size="xl" animate={false}>
      <div className="flex gap-6 py-8">
        <DashboardSidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </PageContainer>
  );
}
