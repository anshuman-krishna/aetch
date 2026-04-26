export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { withErrorHandler } from '@/lib/api-error';
import { withRequestId } from '@/backend/middleware/request-log';
import {
  getMessages,
  getConversationById,
  markConversationRead,
} from '@/backend/services/message-service';
import { emitConversationRead } from '@/backend/realtime/socket-server';
import { getPaginationParams } from '@/utils/pagination';
import { paginationSchema } from '@/lib/validations';

interface Params {
  params: Promise<{ conversationId: string }>;
}

// get messages for conversation
export const GET = withErrorHandler(async (req: Request, ctx: unknown) => {
  const { params } = ctx as Params;
  const { session, error } = await authGuard();
  if (error) return withRequestId(req, error);

  const { conversationId } = await params;
  const { searchParams } = new URL(req.url);

  const parsed = paginationSchema.safeParse({
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
  });
  const page = parsed.success ? parsed.data.page : 1;
  const limit = parsed.success ? parsed.data.limit : 50;

  try {
    const conversation = await getConversationById(conversationId, session.user.id);
    if (!conversation) {
      return withRequestId(req, NextResponse.json({ error: 'Forbidden' }, { status: 403 }));
    }

    const result = await getMessages(
      conversationId,
      session.user.id,
      getPaginationParams(page, limit),
    );

    return withRequestId(req, NextResponse.json({ conversation, ...result }));
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed';
    return withRequestId(req, NextResponse.json({ error: msg }, { status: 403 }));
  }
}, 'GET /api/messages/[conversationId]');

// mark conversation as read + broadcast receipt
export const PATCH = withErrorHandler(async (req: Request, ctx: unknown) => {
  const { params } = ctx as Params;
  const { session, error } = await authGuard();
  if (error) return withRequestId(req, error);

  const { conversationId } = await params;

  try {
    await markConversationRead(conversationId, session.user.id);
    emitConversationRead(conversationId, session.user.id);
    return withRequestId(req, NextResponse.json({ success: true }));
  } catch {
    return withRequestId(req, NextResponse.json({ error: 'Failed' }, { status: 400 }));
  }
}, 'PATCH /api/messages/[conversationId]');
