export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/backend/middleware/rate-limit';
import { errors, withErrorHandler } from '@/lib/api-error';
import { logger } from '@/lib/logger';

const schema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
});

export const POST = withErrorHandler(async (req: Request) => {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';
  const { success, error } = await rateLimit(ip, 'api');
  if (!success) return error;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return errors.badRequest('Enter a valid email');

  // interim sink — swap for an esp or a dedicated table when ready
  logger.info({ event: 'waitlist_signup', email: parsed.data.email }, 'waitlist signup');

  return NextResponse.json({ success: true });
});
