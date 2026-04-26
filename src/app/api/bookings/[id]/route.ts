export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { requireRole } from '@/backend/middleware/role-guard';
import { withErrorHandler } from '@/lib/api-error';
import { withRequestId } from '@/backend/middleware/request-log';
import {
  getBookingById,
  updateBookingStatus,
  VALID_TRANSITIONS,
} from '@/backend/services/booking-service';
import { getArtistByUserId } from '@/backend/services/artist-service';
import { notifyBookingStatusChange } from '@/backend/services/notification-service';
import { updateBookingStatusSchema } from '@/lib/validations';

interface Params {
  params: Promise<{ id: string }>;
}

export const GET = withErrorHandler(async (req: Request, ctx: unknown) => {
  const { params } = ctx as Params;
  const { session, error } = await authGuard();
  if (error) return withRequestId(req, error);

  const { id } = await params;
  const booking = await getBookingById(id);

  if (!booking) {
    return withRequestId(req, NextResponse.json({ error: 'Booking not found' }, { status: 404 }));
  }

  // verify owner or artist
  const artist = await getArtistByUserId(session.user.id);
  if (booking.userId !== session.user.id && booking.artistId !== artist?.id) {
    return withRequestId(req, NextResponse.json({ error: 'Forbidden' }, { status: 403 }));
  }

  return withRequestId(req, NextResponse.json(booking));
}, 'GET /api/bookings/[id]');

// artist updates booking status
export const PATCH = withErrorHandler(async (req: Request, ctx: unknown) => {
  const { params } = ctx as Params;
  const { session, error } = await requireRole('ARTIST', 'ADMIN');
  if (error) return withRequestId(req, error);

  const { id } = await params;
  const body = await req.json();
  const parsed = updateBookingStatusSchema.safeParse(body);
  if (!parsed.success) {
    return withRequestId(
      req,
      NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 }),
    );
  }

  const artist = await getArtistByUserId(session.user.id);
  if (!artist) {
    return withRequestId(
      req,
      NextResponse.json({ error: 'Artist profile not found' }, { status: 404 }),
    );
  }

  // validate state transition
  const existing = await getBookingById(id);
  if (!existing) {
    return withRequestId(req, NextResponse.json({ error: 'Booking not found' }, { status: 404 }));
  }

  const allowed = VALID_TRANSITIONS[existing.status] ?? [];
  if (!allowed.includes(parsed.data.status)) {
    return withRequestId(
      req,
      NextResponse.json(
        {
          success: false,
          error: `Cannot transition from ${existing.status} to ${parsed.data.status}`,
        },
        { status: 400 },
      ),
    );
  }

  try {
    const booking = await updateBookingStatus(id, artist.id, parsed.data);

    // notify client (non-blocking)
    notifyBookingStatusChange(
      booking.id,
      booking.userId,
      parsed.data.status,
      artist.displayName,
    ).catch(() => {});

    return withRequestId(req, NextResponse.json({ success: true, booking }));
  } catch {
    return withRequestId(
      req,
      NextResponse.json({ error: 'Booking not found or unauthorized' }, { status: 404 }),
    );
  }
}, 'PATCH /api/bookings/[id]');
