export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { withErrorHandler } from '@/lib/api-error';
import { withRequestId } from '@/backend/middleware/request-log';
import { createComment, getPostComments } from '@/backend/services/comment-service';
import { getPostById } from '@/backend/services/post-service';
import { notifyPostComment } from '@/backend/services/notification-service';
import { createCommentSchema } from '@/lib/validations';
import { rateLimit } from '@/backend/middleware/rate-limit';

interface Params {
  params: Promise<{ id: string }>;
}

export const GET = withErrorHandler(async (req: Request, ctx: unknown) => {
  const { params } = ctx as Params;
  const { id } = await params;
  const comments = await getPostComments(id);
  return withRequestId(req, NextResponse.json({ comments }));
}, 'GET /api/posts/[id]/comments');

export const POST = withErrorHandler(async (req: Request, ctx: unknown) => {
  const { params } = ctx as Params;
  const { session, error } = await authGuard();
  if (error) return withRequestId(req, error);

  const rl = await rateLimit(session.user.id, 'api');
  if (!rl.success) return withRequestId(req, rl.error);

  const { id: postId } = await params;
  const body = await req.json();
  const parsed = createCommentSchema.safeParse({ ...body, postId });

  if (!parsed.success) {
    return withRequestId(
      req,
      NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 },
      ),
    );
  }

  const comment = await createComment({
    authorId: session.user.id,
    postId: parsed.data.postId,
    content: parsed.data.content,
    parentId: parsed.data.parentId,
  });

  // notify author (non-blocking)
  getPostById(postId)
    .then((post) => {
      if (post && post.authorId !== session.user.id) {
        notifyPostComment(post.authorId, postId, session.user.name ?? 'Someone');
      }
    })
    .catch(() => {});

  return withRequestId(req, NextResponse.json({ comment }, { status: 201 }));
}, 'POST /api/posts/[id]/comments');
