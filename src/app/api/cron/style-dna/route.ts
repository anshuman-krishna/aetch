export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-error';
import { withRequestId } from '@/backend/middleware/request-log';
import { assertCronAuth } from '@/lib/cron';
import { recomputeAllStyleDna } from '@/backend/services/style-dna-service';

// vercel cron: weekly style-dna recompute (sundays 04:00 utc)
export const GET = withErrorHandler(async (req: Request) => {
  const unauth = assertCronAuth(req);
  if (unauth) return withRequestId(req, unauth);

  const result = await recomputeAllStyleDna();
  return withRequestId(req, NextResponse.json({ success: true, ...result }));
}, 'GET /api/cron/style-dna');
