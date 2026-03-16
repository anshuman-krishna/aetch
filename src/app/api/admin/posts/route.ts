export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { requireRole } from '@/backend/middleware/role-guard';
import { prisma } from '@/lib/prisma';

// delete post (admin only)
export async function DELETE(req: Request) {
  const { error } = await requireRole('ADMIN');
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const postId = searchParams.get('id');

  if (!postId) {
    return NextResponse.json(
      { success: false, error: 'Post ID required' },
      { status: 400 },
    );
  }

  await prisma.post.delete({ where: { id: postId } });
  return NextResponse.json({ success: true });
}
