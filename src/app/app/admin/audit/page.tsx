import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassBadge } from '@/components/ui/glass-badge';
import { listAuditEvents } from '@/backend/services/audit-log-service';
import { getPaginationParams } from '@/utils/pagination';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Audit log — Admin',
};

interface SearchParams {
  page?: string;
  action?: string;
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user?.roles?.includes('ADMIN')) redirect('/');

  const sp = await searchParams;
  const page = Number(sp.page ?? 1) || 1;
  const pagination = getPaginationParams(page, 50);

  const { events, pagination: meta } = await listAuditEvents({}, pagination);

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted">
        Showing {events.length} of {meta.total} events
      </div>

      <GlassCard padding="sm" className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10 text-left text-muted">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Target</th>
              <th className="px-4 py-3">IP</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-b border-white/5">
                <td className="px-4 py-3 text-foreground">
                  {new Date(e.createdAt).toISOString().replace('T', ' ').slice(0, 19)}
                </td>
                <td className="px-4 py-3 text-foreground">
                  {e.actor.username ?? e.actor.email ?? e.actor.id.slice(0, 8)}
                </td>
                <td className="px-4 py-3">
                  <GlassBadge>{e.action}</GlassBadge>
                </td>
                <td className="px-4 py-3 text-muted">
                  {e.targetType ? `${e.targetType}/${e.targetId ?? ''}` : '—'}
                </td>
                <td className="px-4 py-3 text-muted text-xs">{e.ipAddress ?? '—'}</td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted">
                  No audit events yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
