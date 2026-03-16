export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { rateLimit } from '@/backend/middleware/rate-limit';
import { getTattoos } from '@/backend/services/tattoo-service';
import { tattooFilterSchema, paginationSchema } from '@/lib/validations';
import { getPaginationParams } from '@/utils/pagination';

// search tattoos with filters
export async function GET(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anon';
  const rl = await rateLimit(ip, 'api');
  if (!rl.success) return rl.error;

  const { searchParams } = new URL(req.url);

  const filters = tattooFilterSchema.safeParse({
    styles: searchParams.getAll('styles'),
    bodyPlacement: searchParams.get('bodyPlacement') || undefined,
    colorType: searchParams.get('colorType') || undefined,
    search: searchParams.get('q') || undefined,
    sort: searchParams.get('sort') || 'latest',
  });

  const page = paginationSchema.safeParse({
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
  });

  const pagination = getPaginationParams(
    page.success ? page.data.page : 1,
    page.success ? page.data.limit : 20,
  );

  const artistId = searchParams.get('artistId') || undefined;

  const result = await getTattoos(
    {
      styles: filters.success ? filters.data.styles : undefined,
      bodyPlacement: filters.success ? filters.data.bodyPlacement : undefined,
      colorType: filters.success ? filters.data.colorType : undefined,
      search: filters.success ? filters.data.search : undefined,
      artistId,
    },
    pagination,
    filters.success ? filters.data.sort : 'latest',
  );

  return NextResponse.json({ success: true, ...result });
}
