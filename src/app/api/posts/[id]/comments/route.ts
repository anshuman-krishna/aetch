export const runtime = "nodejs";

import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { createComment, getPostComments } from '@/backend/services/comment-service';
import { getPostById } from '@/backend/services/post-service';
import { notifyPostComment } from '@/backend/services/notification-service';
import { createCommentSchema } from '@/lib/validations';
import { rateLimit } from '@/backend/middleware/rate-limit';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const comments = await getPostComments(id);
  return NextResponse.json({ comments });
}

export async function POST(req: Request, { params }: Params) {
  const { session, error } = await authGuard();
  if (error) return error;

  const rl = await rateLimit(session!.user.id, 'api');
  if (!rl.success) return rl.error;

  const { id: postId } = await params;
  const body = await req.json();
  const parsed = createCommentSchema.safeParse({ ...body, postId });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    );
  }

  const comment = await createComment({
    authorId: session!.user.id,
    postId: parsed.data.postId,
    content: parsed.data.content,
    parentId: parsed.data.parentId,
  });

  // notify author (non-blocking)
  getPostById(postId).then((post) => {
    if (post && post.authorId !== session!.user.id) {
      notifyPostComment(post.authorId, postId, session!.user.name ?? 'Someone');
    }
  }).catch(() => {});

  return NextResponse.json({ comment }, { status: 201 });
}
