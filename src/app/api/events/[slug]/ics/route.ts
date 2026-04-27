export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-error';
import { withRequestId } from '@/backend/middleware/request-log';
import { getEventBySlug, eventToIcs } from '@/backend/services/event-service';

interface Ctx {
  params: Promise<{ slug: string }>;
}

export const GET = withErrorHandler(async (req: Request, ctx: unknown) => {
  const { params } = ctx as Ctx;
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) {
    return withRequestId(
      req,
      NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 }),
    );
  }
  const ics = eventToIcs(event);
  return withRequestId(
    req,
    new NextResponse(ics, {
      status: 200,
      headers: {
        'content-type': 'text/calendar; charset=utf-8',
        'content-disposition': `attachment; filename="${event.slug}.ics"`,
      },
    }),
  );
}, 'GET /api/events/[slug]/ics');
