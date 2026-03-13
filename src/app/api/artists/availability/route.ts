import { NextResponse } from 'next/server';
import { requireRole } from '@/backend/middleware/role-guard';
import { getArtistByUserId, getArtistAvailability, setArtistAvailability } from '@/backend/services/artist-service';
import { availabilityBulkSchema } from '@/lib/validations';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const artistId = searchParams.get('artistId');

  if (!artistId) {
    return NextResponse.json({ error: 'artistId required' }, { status: 400 });
  }

  const slots = await getArtistAvailability(artistId);
  return NextResponse.json({ slots });
}

export async function PUT(req: Request) {
  const { session, error } = await requireRole('ARTIST', 'ADMIN');
  if (error) return error;

  const artist = await getArtistByUserId(session!.user.id);
  if (!artist) {
    return NextResponse.json({ error: 'Artist profile not found' }, { status: 404 });
  }

  const body = await req.json();
  const parsed = availabilityBulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  await setArtistAvailability(artist.id, parsed.data.slots);
  const slots = await getArtistAvailability(artist.id);
  return NextResponse.json({ success: true, slots });
}
