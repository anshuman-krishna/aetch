import { GlassCard } from '@/components/ui/glass-card';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin — AETCH',
};

// admin overview stats
export default async function AdminOverviewPage() {
  const [users, posts, tattoos, reports, audit] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.tattoo.count(),
    prisma.report.count({ where: { status: 'PENDING' } }),
    prisma.adminAuditLog.count(),
  ]);

  const cards = [
    { label: 'Users', value: users },
    { label: 'Posts', value: posts },
    { label: 'Tattoos', value: tattoos },
    { label: 'Reports (pending)', value: reports },
    { label: 'Audit events', value: audit },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((c) => (
        <GlassCard key={c.label} padding="md">
          <div className="text-sm text-muted">{c.label}</div>
          <div className="text-2xl font-semibold text-foreground">{c.value}</div>
        </GlassCard>
      ))}
    </div>
  );
}
