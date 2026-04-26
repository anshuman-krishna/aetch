export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { withErrorHandler } from '@/lib/api-error';
import { withRequestId } from '@/backend/middleware/request-log';
import { rateLimit } from '@/backend/middleware/rate-limit';
import { togglePostLike, getPostById } from '@/backend/services/post-service';
import { notifyPostLike } from '@/backend/services/notification-service';

interface Params {
  params: Promise<{ id: string }>;
}

export const POST = withErrorHandler(async (req: Request, ctx: unknown) => {
  const { params } = ctx as Params;
  const { session, error } = await authGuard();
  if (error) return withRequestId(req, error);

  const rl = await rateLimit(session.user.id, 'api');
  if (!rl.success) return withRequestId(req, rl.error);

  const { id } = await params;
  const result = await togglePostLike(session.user.id, id);

  // notify author (non-blocking)
  if (result.liked) {
    getPostById(id)
      .then((post) => {
        if (post && post.authorId !== session.user.id) {
          notifyPostLike(post.authorId, id, session.user.name ?? 'Someone');
        }
      })
      .catch(() => {});
  }

  return withRequestId(req, NextResponse.json({ success: true, ...result }));
}, 'POST /api/posts/[id]/like');
