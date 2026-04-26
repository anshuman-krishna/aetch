export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { withErrorHandler } from '@/lib/api-error';
import { withRequestId } from '@/backend/middleware/request-log';
import { priceEstimateSchema } from '@/lib/validations';
import { estimatePrice } from '@/backend/services/price-estimator-service';
import { getArtistByUserId } from '@/backend/services/artist-service';
import { prisma } from '@/lib/prisma';

export const POST = withErrorHandler(async (req: Request) => {
  const { session, error } = await authGuard();
  if (error) return withRequestId(req, error);

  const body = await req.json();
  const parsed = priceEstimateSchema.safeParse(body);
  if (!parsed.success) {
    return withRequestId(
      req,
      NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 },
      ),
    );
  }

  let hourlyRate = parsed.data.hourlyRate;
  if (!hourlyRate) {
    const artist = parsed.data.artistId
      ? await prisma.artist.findUnique({
          where: { id: parsed.data.artistId },
          select: { hourlyRate: true },
        })
      : await getArtistByUserId(session.user.id);
    hourlyRate = Number(artist?.hourlyRate ?? 150);
  }

  const estimate = estimatePrice({
    hourlyRate,
    size: parsed.data.size,
    colorType: parsed.data.colorType,
    placement: parsed.data.placement,
    complexity: parsed.data.complexity,
    styles: parsed.data.styles,
  });

  return withRequestId(req, NextResponse.json({ success: true, estimate }));
}, 'POST /api/price-estimate');
