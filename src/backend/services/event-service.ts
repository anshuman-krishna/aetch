import { prisma } from '@/lib/prisma';
import { type PaginationParams, buildPaginationMeta } from '@/utils/pagination';
import type { EventAttendanceStatus } from '@prisma/client';

interface CreateEventInput {
  name: string;
  slug: string;
  description?: string;
  venue?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  startsAt: Date;
  endsAt: Date;
  websiteUrl?: string;
  coverImage?: string;
}

export async function createEvent(data: CreateEventInput) {
  return prisma.event.create({ data });
}

export async function listUpcomingEvents(pagination: PaginationParams) {
  const where = { endsAt: { gte: new Date() } } as const;
  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { startsAt: 'asc' },
      skip: pagination.skip,
      take: pagination.limit,
      include: {
        _count: { select: { attendees: true } },
      },
    }),
    prisma.event.count({ where }),
  ]);
  return { events, pagination: buildPaginationMeta(total, pagination) };
}

export async function getEventBySlug(slug: string) {
  return prisma.event.findUnique({
    where: { slug },
    include: {
      attendees: {
        take: 50,
        orderBy: { createdAt: 'desc' },
      },
      _count: { select: { attendees: true } },
    },
  });
}

export async function rsvpToEvent(eventId: string, userId: string, status: EventAttendanceStatus) {
  return prisma.eventAttendance.upsert({
    where: { eventId_userId: { eventId, userId } },
    create: { eventId, userId, status },
    update: { status },
  });
}

export async function cancelRsvp(eventId: string, userId: string) {
  return prisma.eventAttendance.deleteMany({
    where: { eventId, userId },
  });
}

// build an RFC 5545 ICS calendar entry
export function eventToIcs(event: {
  id: string;
  name: string;
  description?: string | null;
  venue?: string | null;
  city?: string | null;
  startsAt: Date;
  endsAt: Date;
  websiteUrl?: string | null;
}): string {
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '').slice(0, 15) + 'Z';
  const escape = (s?: string | null) =>
    s
      ?.replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\n')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;') ?? '';
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AETCH//Tattoo Events//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${event.id}@aetch.app`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(event.startsAt)}`,
    `DTEND:${fmt(event.endsAt)}`,
    `SUMMARY:${escape(event.name)}`,
    event.description ? `DESCRIPTION:${escape(event.description)}` : '',
    event.venue || event.city ? `LOCATION:${escape([event.venue, event.city].filter(Boolean).join(', '))}` : '',
    event.websiteUrl ? `URL:${escape(event.websiteUrl)}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');
}
