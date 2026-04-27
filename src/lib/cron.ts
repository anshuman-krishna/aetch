import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

// guard cron endpoints — vercel sets `Authorization: Bearer ${CRON_SECRET}`
// also accept a query token so internal triggers can call without exposing the bearer
export function assertCronAuth(req: Request): NextResponse | null {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    logger.warn('CRON_SECRET not set — cron endpoint is unprotected');
    return null;
  }
  const auth = req.headers.get('authorization');
  if (auth === `Bearer ${expected}`) return null;
  const url = new URL(req.url);
  if (url.searchParams.get('token') === expected) return null;
  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
}
