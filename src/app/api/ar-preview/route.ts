export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { withErrorHandler } from '@/lib/api-error';
import { withRequestId } from '@/backend/middleware/request-log';
import { rateLimit } from '@/backend/middleware/rate-limit';
import { savePreview } from '@/backend/services/ar-preview-service';
import { savePreviewSchema } from '@/lib/validations';

export const POST = withErrorHandler(async (req: Request) => {
  const { session, error } = await authGuard();
  if (error) return withRequestId(req, error);

  const rl = await rateLimit(session.user.id, 'ar-preview');
  if (!rl.success) return withRequestId(req, rl.error);

  const body = await req.json();
  const parsed = savePreviewSchema.safeParse(body);
  if (!parsed.success) {
    return withRequestId(
      req,
      NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 },
      ),
    );
  }

  try {
    const preview = await savePreview({
      userId: session.user.id,
      ...parsed.data,
    });
    return withRequestId(req, NextResponse.json({ preview }, { status: 201 }));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Save failed';
    const status = message.includes('disabled') ? 403 : 500;
    return withRequestId(req, NextResponse.json({ error: message }, { status }));
  }
}, 'POST /api/ar-preview');
