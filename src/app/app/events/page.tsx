import Link from 'next/link';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassBadge } from '@/components/ui/glass-badge';
import { listUpcomingEvents } from '@/backend/services/event-service';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { getPaginationParams } from '@/utils/pagination';

export const metadata = {
  title: 'Tattoo Events & Conventions — AETCH',
  description: 'Upcoming tattoo conventions, expos and meet-ups around the world.',
};

export default async function EventsPage() {
  if (!isFeatureEnabled('EVENTS_ENABLED')) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16">
        <GlassCard padding="lg" className="text-center">
          <h1 className="text-h2 text-foreground mb-2">Events</h1>
          <p className="text-muted">Coming soon. Set <code>FF_EVENTS=true</code> to enable.</p>
        </GlassCard>
      </div>
    );
  }

  const { events } = await listUpcomingEvents(getPaginationParams(1, 24));

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 space-y-6">
      <div>
        <h1 className="text-h2 text-foreground">Tattoo Conventions</h1>
        <p className="mt-1 text-muted">Upcoming events around the world.</p>
      </div>

      {events.length === 0 ? (
        <GlassCard padding="lg" className="text-center">
          <p className="text-muted">No upcoming events yet.</p>
        </GlassCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {events.map((event) => (
            <Link key={event.id} href={`/app/events/${event.slug}`}>
              <GlassCard padding="md" className="hover:bg-white/10 transition h-full">
                <div className="flex items-center justify-between">
                  <h2 className="text-h4 text-foreground">{event.name}</h2>
                  <GlassBadge variant="primary">
                    {event._count.attendees} going
                  </GlassBadge>
                </div>
                <p className="text-xs text-muted mt-1">
                  {new Date(event.startsAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  {event.city && ` · ${event.city}`}
                </p>
                {event.description && (
                  <p className="text-sm text-muted mt-2 line-clamp-3">{event.description}</p>
                )}
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
