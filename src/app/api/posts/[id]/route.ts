export const runtime = "nodejs";

import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { getPostById, deletePost } from '@/backend/services/post-service';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }
  return NextResponse.json({ post });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { session, error } = await authGuard();
  if (error) return error;

  const { id } = await params;
  try {
    await deletePost(id, session!.user.id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }
}
