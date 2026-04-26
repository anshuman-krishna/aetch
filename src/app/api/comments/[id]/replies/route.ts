export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-error';
import { withRequestId } from '@/backend/middleware/request-log';
import { getCommentReplies } from '@/backend/services/comment-service';

interface Params {
  params: Promise<{ id: string }>;
}

// fetch full reply list for a parent comment (depth-1 threading)
export const GET = withErrorHandler(async (req: Request, ctx: unknown) => {
  const { params } = ctx as Params;
  const { id } = await params;
  const replies = await getCommentReplies(id);
  return withRequestId(req, NextResponse.json({ replies }));
}, 'GET /api/comments/[id]/replies');
