export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { withErrorHandler } from '@/lib/api-error';
import { withRequestId } from '@/backend/middleware/request-log';
import { rateLimit } from '@/backend/middleware/rate-limit';
import { linkPreviewSchema } from '@/lib/validations';
import { getLinkPreview } from '@/backend/services/link-preview-service';

export const GET = withErrorHandler(async (req: Request) => {
  const { session, error } = await authGuard();
  if (error) return withRequestId(req, error);

  const rl = await rateLimit(session.user.id, 'api');
  if (!rl.success) return withRequestId(req, rl.error);

  const url = new URL(req.url).searchParams.get('url');
  const parsed = linkPreviewSchema.safeParse({ url });
  if (!parsed.success) {
    return withRequestId(
      req,
      NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid url' },
        { status: 400 },
      ),
    );
  }
  const preview = await getLinkPreview(parsed.data.url);
  if (!preview) {
    return withRequestId(req, NextResponse.json({ success: true, preview: null }));
  }
  return withRequestId(req, NextResponse.json({ success: true, preview }));
}, 'GET /api/link-preview');
