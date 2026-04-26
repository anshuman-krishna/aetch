export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { withErrorHandler } from '@/lib/api-error';
import { withRequestId } from '@/backend/middleware/request-log';
import { rateLimit } from '@/backend/middleware/rate-limit';
import { aftercareSchema } from '@/lib/validations';
import { askAftercare } from '@/backend/services/aftercare-service';

export const POST = withErrorHandler(async (req: Request) => {
  const { session, error } = await authGuard();
  if (error) return withRequestId(req, error);

  const rl = await rateLimit(session.user.id, 'ai');
  if (!rl.success) return withRequestId(req, rl.error);

  const body = await req.json();
  const parsed = aftercareSchema.safeParse(body);
  if (!parsed.success) {
    return withRequestId(
      req,
      NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 },
      ),
    );
  }

  try {
    const reply = await askAftercare(parsed.data);
    return withRequestId(req, NextResponse.json({ success: true, reply }));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Aftercare failed';
    const status = message.includes('disabled') ? 403 : 500;
    return withRequestId(req, NextResponse.json({ success: false, error: message }, { status }));
  }
}, 'POST /api/aftercare');
