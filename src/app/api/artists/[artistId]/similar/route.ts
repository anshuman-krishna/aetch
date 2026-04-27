export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-error';
import { withRequestId } from '@/backend/middleware/request-log';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { findSimilarArtists } from '@/backend/services/style-dna-service';

interface Ctx {
  params: Promise<{ artistId: string }>;
}

export const GET = withErrorHandler(async (req: Request, ctx: unknown) => {
  if (!isFeatureEnabled('STYLE_DNA_ENABLED')) {
    return withRequestId(req, NextResponse.json({ success: true, similar: [] }));
  }
  const { params } = ctx as Ctx;
  const { artistId } = await params;
  const url = new URL(req.url);
  const limit = Math.min(20, Math.max(1, Number(url.searchParams.get('limit') ?? 8)));
  const similar = await findSimilarArtists(artistId, limit);
  return withRequestId(req, NextResponse.json({ success: true, similar }));
}, 'GET /api/artists/[artistId]/similar');
