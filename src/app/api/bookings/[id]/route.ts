export const runtime = "nodejs";

import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { requireRole } from '@/backend/middleware/role-guard';
import { getBookingById, updateBookingStatus } from '@/backend/services/booking-service';
import { getArtistByUserId } from '@/backend/services/artist-service';
import { notifyBookingStatusChange } from '@/backend/services/notification-service';
import { updateBookingStatusSchema } from '@/lib/validations';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: Params) {
  const { session, error } = await authGuard();
  if (error) return error;

  const { id } = await params;
  const booking = await getBookingById(id);

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  // verify owner or artist
  const artist = await getArtistByUserId(session.user.id);
  if (booking.userId !== session.user.id && booking.artistId !== artist?.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json(booking);
}

// artist updates booking status
export async function PATCH(req: Request, { params }: Params) {
  const { session, error } = await requireRole('ARTIST', 'ADMIN');
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = updateBookingStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const artist = await getArtistByUserId(session!.user.id);
  if (!artist) {
    return NextResponse.json({ error: 'Artist profile not found' }, { status: 404 });
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

    return NextResponse.json({ success: true, booking });
  } catch {
    return NextResponse.json({ error: 'Booking not found or unauthorized' }, { status: 404 });
  }
}
