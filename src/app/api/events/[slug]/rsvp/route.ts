export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { withErrorHandler } from '@/lib/api-error';
import { withRequestId } from '@/backend/middleware/request-log';
import { eventRsvpSchema } from '@/lib/validations';
import { rsvpToEvent, cancelRsvp, getEventBySlug } from '@/backend/services/event-service';

interface Ctx {
  params: Promise<{ slug: string }>;
}

export const POST = withErrorHandler(async (req: Request, ctx: unknown) => {
  const { session, error } = await authGuard();
  if (error) return withRequestId(req, error);

  const { params } = ctx as Ctx;
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) {
    return withRequestId(
      req,
      NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 }),
    );
  }
  const body = await req.json();
  const parsed = eventRsvpSchema.safeParse(body);
  if (!parsed.success) {
    return withRequestId(
      req,
      NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid status' },
        { status: 400 },
      ),
    );
  }
  const rsvp = await rsvpToEvent(event.id, session.user.id, parsed.data.status);
  return withRequestId(req, NextResponse.json({ success: true, rsvp }));
}, 'POST /api/events/[slug]/rsvp');

export const DELETE = withErrorHandler(async (req: Request, ctx: unknown) => {
  const { session, error } = await authGuard();
  if (error) return withRequestId(req, error);

  const { params } = ctx as Ctx;
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) {
    return withRequestId(
      req,
      NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 }),
    );
  }
  await cancelRsvp(event.id, session.user.id);
  return withRequestId(req, NextResponse.json({ success: true }));
}, 'DELETE /api/events/[slug]/rsvp');
