export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { withErrorHandler } from '@/lib/api-error';
import { withRequestId } from '@/backend/middleware/request-log';
import { rateLimit } from '@/backend/middleware/rate-limit';
import { deleteRepost, repostPost } from '@/backend/services/repost-service';
import { repostSchema } from '@/lib/validations';

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
  let caption: string | undefined;
  try {
    const body = await req.json();
    const parsed = repostSchema.safeParse({ postId: id, caption: body?.caption });
    if (parsed.success) caption = parsed.data.caption;
  } catch {
    /* no body — silent repost */
  }

  try {
    const repost = await repostPost(session.user.id, id, caption);
    return withRequestId(req, NextResponse.json({ success: true, repost }, { status: 201 }));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Repost failed';
    return withRequestId(
      req,
      NextResponse.json({ success: false, error: message }, { status: 400 }),
    );
  }
}, 'POST /api/posts/[id]/repost');

export const DELETE = withErrorHandler(async (req: Request, ctx: unknown) => {
  const { params } = ctx as Params;
  const { session, error } = await authGuard();
  if (error) return withRequestId(req, error);

  const { id } = await params;
  try {
    await deleteRepost(session.user.id, id);
    return withRequestId(req, NextResponse.json({ success: true }));
  } catch {
    return withRequestId(
      req,
      NextResponse.json({ success: false, error: 'Repost not found' }, { status: 404 }),
    );
  }
}, 'DELETE /api/posts/[id]/repost');
