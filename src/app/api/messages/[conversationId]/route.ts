export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import {
  getMessages,
  getConversationById,
  markConversationRead,
} from '@/backend/services/message-service';
import { getPaginationParams } from '@/utils/pagination';
import { paginationSchema } from '@/lib/validations';

interface Params {
  params: Promise<{ conversationId: string }>;
}

// get messages for conversation
export async function GET(req: Request, { params }: Params) {
  const { session, error } = await authGuard();
  if (error) return error;

  const { conversationId } = await params;
  const { searchParams } = new URL(req.url);

  const parsed = paginationSchema.safeParse({
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
  });
  const page = parsed.success ? parsed.data.page : 1;
  const limit = parsed.success ? parsed.data.limit : 50;

  try {
    const [conversation, result] = await Promise.all([
      getConversationById(conversationId, session.user.id),
      getMessages(
        conversationId,
        session.user.id,
        getPaginationParams(page, limit),
      ),
    ]);

    if (!conversation) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ conversation, ...result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed';
    return NextResponse.json({ error: msg }, { status: 403 });
  }
}

// mark conversation as read
export async function PATCH(_req: Request, { params }: Params) {
  const { session, error } = await authGuard();
  if (error) return error;

  const { conversationId } = await params;

  try {
    await markConversationRead(conversationId, session.user.id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 400 });
  }
}
