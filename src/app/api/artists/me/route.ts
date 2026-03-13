export const runtime = "nodejs";

import { NextResponse } from 'next/server';
import { requireRole } from '@/backend/middleware/role-guard';
import { getArtistByUserId, updateArtist } from '@/backend/services/artist-service';
import { updateArtistSchema } from '@/lib/validations';

export async function GET() {
  const { session, error } = await requireRole('ARTIST', 'ADMIN');
  if (error) return error;

  const artist = await getArtistByUserId(session!.user.id);
  if (!artist) {
    return NextResponse.json({ error: 'Artist profile not found' }, { status: 404 });
  }

  return NextResponse.json({ artist });
}

export async function PATCH(req: Request) {
  const { session, error } = await requireRole('ARTIST', 'ADMIN');
  if (error) return error;

  const artist = await getArtistByUserId(session!.user.id);
  if (!artist) {
    return NextResponse.json({ error: 'Artist profile not found' }, { status: 404 });
  }

  const body = await req.json();
  const parsed = updateArtistSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const updated = await updateArtist(artist.id, parsed.data);
  return NextResponse.json({ success: true, artist: updated });
}
