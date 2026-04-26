import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { PageContainer } from '@/components/layouts/page-container';

const tabs = [
  { href: '/app/admin', label: 'Overview' },
  { href: '/app/admin/audit', label: 'Audit log' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/app/admin');
  if (!session.user.roles?.includes('ADMIN')) redirect('/');

  return (
    <PageContainer size="xl" animate={false}>
      <div className="py-8">
        <h1 className="text-h2 text-foreground mb-6">Admin</h1>
        <nav className="flex gap-2 mb-6">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="rounded-xl px-4 py-2 text-sm bg-white/10 hover:bg-white/15 text-foreground transition-colors"
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <main>{children}</main>
      </div>
    </PageContainer>
  );
}
