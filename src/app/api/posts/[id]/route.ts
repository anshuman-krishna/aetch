export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { withErrorHandler } from '@/lib/api-error';
import { withRequestId } from '@/backend/middleware/request-log';
import { getPostById, deletePost } from '@/backend/services/post-service';

interface Params {
  params: Promise<{ id: string }>;
}

export const GET = withErrorHandler(async (req: Request, ctx: unknown) => {
  const { params } = ctx as Params;
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) {
    return withRequestId(req, NextResponse.json({ error: 'Post not found' }, { status: 404 }));
  }
  return withRequestId(req, NextResponse.json({ post }));
}, 'GET /api/posts/[id]');

export const DELETE = withErrorHandler(async (req: Request, ctx: unknown) => {
  const { params } = ctx as Params;
  const { session, error } = await authGuard();
  if (error) return withRequestId(req, error);

  const { id } = await params;
  try {
    await deletePost(id, session.user.id);
    return withRequestId(req, NextResponse.json({ success: true }));
  } catch {
    return withRequestId(req, NextResponse.json({ error: 'Post not found' }, { status: 404 }));
  }
}, 'DELETE /api/posts/[id]');
