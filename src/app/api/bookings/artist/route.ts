export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { requireRole } from '@/backend/middleware/role-guard';
import { getArtistByUserId } from '@/backend/services/artist-service';
import { getArtistBookings } from '@/backend/services/booking-service';
import { getPaginationParams } from '@/utils/pagination';

export async function GET(req: Request) {
  const { session, error } = await requireRole('ARTIST', 'ADMIN');
  if (error) return error;

  const artist = await getArtistByUserId(session!.user.id);
  if (!artist) {
    return NextResponse.json({ error: 'Artist profile not found' }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? '20');
  const status = searchParams.get('status') ?? undefined;
  const pagination = getPaginationParams(page, limit);

  const result = await getArtistBookings(artist.id, pagination, status);
  return NextResponse.json(result);
}
