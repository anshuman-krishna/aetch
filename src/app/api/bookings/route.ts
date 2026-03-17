export const runtime = "nodejs";

import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { rateLimit } from '@/backend/middleware/rate-limit';
import { createBooking, getUserBookings, hasConflictingBooking } from '@/backend/services/booking-service';
import { getArtistByUserId } from '@/backend/services/artist-service';
import { notifyBookingRequest } from '@/backend/services/notification-service';
import { bookingRequestSchema, paginationSchema } from '@/lib/validations';
import { getPaginationParams } from '@/utils/pagination';

export async function GET(req: Request) {
  const { session, error } = await authGuard();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const parsed = paginationSchema.safeParse({
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
  });
  const page = parsed.success ? parsed.data.page : 1;
  const limit = parsed.success ? parsed.data.limit : 20;
  const pagination = getPaginationParams(page, limit);

  const result = await getUserBookings(session.user.id, pagination);
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const { session, error } = await authGuard();
  if (error) return error;

  const rl = await rateLimit(session.user.id, 'api');
  if (!rl.success) return rl.error;

  try {
    const body = await req.json();
    const parsed = bookingRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { artistId, date, duration, tattooIdea, placement, size, description } = parsed.data;

    // reject past date bookings
    const bookingDate = new Date(date);
    if (bookingDate <= new Date()) {
      return NextResponse.json(
        { success: false, error: 'Booking date must be in the future' },
        { status: 400 },
      );
    }

    // resolve artist user id
    const artist = await getArtistByUserId(artistId);

    // prevent double booking
    const conflict = await hasConflictingBooking(artistId, bookingDate);
    if (conflict) {
      return NextResponse.json(
        { success: false, error: 'Artist has a conflicting booking in that time window' },
        { status: 409 },
      );
    }

    const booking = await createBooking({
      userId: session.user.id,
      artistId,
      date: new Date(date),
      duration,
      tattooIdea,
      placement,
      size,
      description,
    });

    // notify artist (non-blocking)
    if (artist) {
      notifyBookingRequest(
        booking.id,
        artist.userId,
        session.user.name ?? 'Someone',
      ).catch(() => {});
    }

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Booking failed';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
