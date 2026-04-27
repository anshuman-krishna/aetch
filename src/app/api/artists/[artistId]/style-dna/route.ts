export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-error';
import { withRequestId } from '@/backend/middleware/request-log';
import { isFeatureEnabled } from '@/lib/feature-flags';
import {
  getStyleDna,
  computeArtistStyleDna,
  persistStyleDna,
} from '@/backend/services/style-dna-service';
import { authGuard } from '@/backend/middleware/auth-guard';
import { prisma } from '@/lib/prisma';

interface Ctx {
  params: Promise<{ artistId: string }>;
}

export const GET = withErrorHandler(async (req: Request, ctx: unknown) => {
  if (!isFeatureEnabled('STYLE_DNA_ENABLED')) {
    return withRequestId(req, NextResponse.json({ success: true, dna: null }));
  }
  const { params } = ctx as Ctx;
  const { artistId } = await params;
  const dna = await getStyleDna(artistId);
  return withRequestId(req, NextResponse.json({ success: true, dna }));
}, 'GET /api/artists/[artistId]/style-dna');

// owner-triggered recompute
export const POST = withErrorHandler(async (req: Request, ctx: unknown) => {
  if (!isFeatureEnabled('STYLE_DNA_ENABLED')) {
    return withRequestId(
      req,
      NextResponse.json({ success: false, error: 'Style DNA disabled' }, { status: 403 }),
    );
  }
  const { session, error } = await authGuard();
  if (error) return withRequestId(req, error);

  const { params } = ctx as Ctx;
  const { artistId } = await params;
  const artist = await prisma.artist.findUnique({
    where: { id: artistId },
    select: { userId: true },
  });
  if (!artist) {
    return withRequestId(
      req,
      NextResponse.json({ success: false, error: 'Artist not found' }, { status: 404 }),
    );
  }
  if (artist.userId !== session.user.id && !session.user.roles.includes('ADMIN')) {
    return withRequestId(
      req,
      NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 }),
    );
  }

  const result = await computeArtistStyleDna(artistId);
  if (result.sampleSize === 0) {
    return withRequestId(
      req,
      NextResponse.json(
        { success: false, error: 'Need at least one tattoo with a style' },
        { status: 422 },
      ),
    );
  }
  await persistStyleDna(result);
  return withRequestId(req, NextResponse.json({ success: true, dna: result }));
}, 'POST /api/artists/[artistId]/style-dna');
