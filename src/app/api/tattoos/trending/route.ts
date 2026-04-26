export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getTrendingTattoos } from '@/backend/services/tattoo-service';
import { z } from 'zod';

const querySchema = z.object({
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export async function GET(req: NextRequest) {
  const parsed = querySchema.safeParse({
    limit: req.nextUrl.searchParams.get('limit'),
  });
  const limit = parsed.success ? parsed.data.limit : 20;
  const tattoos = await getTrendingTattoos(limit);
  return NextResponse.json({ success: true, tattoos });
}
