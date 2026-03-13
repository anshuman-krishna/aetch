import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { togglePostLike, getPostById } from '@/backend/services/post-service';
import { notifyPostLike } from '@/backend/services/notification-service';

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(_req: Request, { params }: Params) {
  const { session, error } = await authGuard();
  if (error) return error;

  const { id } = await params;
  const result = await togglePostLike(session!.user.id, id);

  // notify author (non-blocking)
  if (result.liked) {
    getPostById(id).then((post) => {
      if (post && post.authorId !== session!.user.id) {
        notifyPostLike(post.authorId, id, session!.user.name ?? 'Someone');
      }
    });
  }

  return NextResponse.json({ success: true, ...result });
}
