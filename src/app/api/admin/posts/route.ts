export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { requireRole } from '@/backend/middleware/role-guard';
import { withErrorHandler } from '@/lib/api-error';
import { withRequestId } from '@/backend/middleware/request-log';
import { prisma } from '@/lib/prisma';
import { recordAuditEvent, clientContext } from '@/backend/services/audit-log-service';

// delete post (admin only)
export const DELETE = withErrorHandler(async (req: Request) => {
  const { session, error } = await requireRole('ADMIN');
  if (error) return withRequestId(req, error);

  const { searchParams } = new URL(req.url);
  const postId = searchParams.get('id');

  if (!postId) {
    return withRequestId(
      req,
      NextResponse.json({ success: false, error: 'Post ID required' }, { status: 400 }),
    );
  }

  await prisma.post.delete({ where: { id: postId } });
  await recordAuditEvent({
    actorId: session.user.id,
    action: 'POST_REMOVE',
    targetType: 'post',
    targetId: postId,
    ...clientContext(req),
  });
  return withRequestId(req, NextResponse.json({ success: true }));
}, 'DELETE /api/admin/posts');
