import { notFound } from 'next/navigation';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassBadge } from '@/components/ui/glass-badge';
import { getEventBySlug } from '@/backend/services/event-service';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { auth } from '@/lib/auth';
import { EventRsvpControls } from '@/components/features/events/event-rsvp-controls';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: 'Event not found' };
  return {
    title: `${event.name} — AETCH`,
    description: event.description ?? `${event.name} on AETCH`,
  };
}

export default async function EventDetailPage({ params }: Props) {
  if (!isFeatureEnabled('EVENTS_ENABLED')) notFound();

  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const session = await auth();
  const myRsvp = session?.user
    ? event.attendees.find((a) => a.userId === session.user.id)?.status ?? null
    : null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 space-y-6">
      <GlassCard padding="lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-h2 text-foreground">{event.name}</h1>
            <p className="mt-1 text-sm text-muted">
              {new Date(event.startsAt).toLocaleString()} →{' '}
              {new Date(event.endsAt).toLocaleString()}
            </p>
            {(event.venue || event.city) && (
              <p className="mt-1 text-sm text-muted">
                {[event.venue, event.city, event.country].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
          <GlassBadge variant="primary">{event._count.attendees} going</GlassBadge>
        </div>

        {event.description && (
          <p className="mt-4 text-sm text-foreground/80 whitespace-pre-line">
            {event.description}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {session?.user ? (
            <EventRsvpControls slug={event.slug} initialStatus={myRsvp ?? undefined} />
          ) : (
            <Link href={`/login?callbackUrl=/app/events/${event.slug}`}>
              <GlassButton variant="primary">Sign in to RSVP</GlassButton>
            </Link>
          )}
          <a href={`/api/events/${event.slug}/ics`}>
            <GlassButton variant="ghost">Add to calendar (.ics)</GlassButton>
          </a>
          {event.websiteUrl && (
            <a href={event.websiteUrl} target="_blank" rel="noopener noreferrer">
              <GlassButton variant="ghost">Official site →</GlassButton>
            </a>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
