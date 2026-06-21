export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { rateLimit } from '@/backend/middleware/rate-limit';
import { getTrendingTattoos } from '@/backend/services/tattoo-service';
import { withErrorHandler } from '@/lib/api-error';

// public read-only spotlight — one trending pick, stable across the day
export const GET = withErrorHandler(async (req: Request) => {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';
  const { success, error } = await rateLimit(ip, 'api');
  if (!success) return error;

  const trending = await getTrendingTattoos(20);
  if (trending.length === 0) {
    return NextResponse.json({ success: true, tattoo: null });
  }

  const dayIndex = Math.floor(Date.now() / 86_400_000) % trending.length;
  const t = trending[dayIndex];

  return NextResponse.json({
    success: true,
    tattoo: {
      title: t.title,
      slug: t.slug,
      imageUrl: t.thumbnailUrl ?? t.imageUrl,
      styles: t.styles,
      artist: {
        name: t.artist.displayName,
        slug: t.artist.slug,
        verified: t.artist.verified,
      },
    },
  });
});
