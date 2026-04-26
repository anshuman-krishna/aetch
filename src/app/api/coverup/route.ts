export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { withErrorHandler } from '@/lib/api-error';
import { withRequestId } from '@/backend/middleware/request-log';
import { rateLimit } from '@/backend/middleware/rate-limit';
import { generateCoverupDesign } from '@/backend/services/ai-service';
import { coverupSchema } from '@/lib/validations';

export const POST = withErrorHandler(async (req: Request) => {
  const { session, error } = await authGuard();
  if (error) return withRequestId(req, error);

  const rl = await rateLimit(session.user.id, 'ai-generation');
  if (!rl.success) return withRequestId(req, rl.error);

  const body = await req.json();
  const parsed = coverupSchema.safeParse(body);
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
    const generation = await generateCoverupDesign({
      userId: session.user.id,
      ...parsed.data,
    });
    return withRequestId(req, NextResponse.json({ success: true, generation }, { status: 201 }));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Generation failed';
    const status = message.includes('limit') || message.includes('disabled') ? 429 : 500;
    return withRequestId(req, NextResponse.json({ success: false, error: message }, { status }));
  }
}, 'POST /api/coverup');
