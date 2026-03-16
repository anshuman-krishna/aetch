export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { rateLimit } from '@/backend/middleware/rate-limit';
import { searchArtists } from '@/backend/services/artist-service';
import { paginationSchema } from '@/lib/validations';
import { getPaginationParams } from '@/utils/pagination';

// search artists by name, location, style
export async function GET(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anon';
  const rl = await rateLimit(ip, 'api');
  if (!rl.success) return rl.error;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || undefined;
  const location = searchParams.get('location') || undefined;
  const style = searchParams.get('style') || undefined;
  const shopId = searchParams.get('shopId') || undefined;

  const page = paginationSchema.safeParse({
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
  });

  const pagination = getPaginationParams(
    page.success ? page.data.page : 1,
    page.success ? page.data.limit : 20,
  );

  const result = await searchArtists(
    { q, location, style, shopId },
    pagination,
  );

  return NextResponse.json({ success: true, ...result });
}
