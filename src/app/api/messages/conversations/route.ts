export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { getUserConversations, findOrCreateConversation } from '@/backend/services/message-service';
import { getPaginationParams } from '@/utils/pagination';
import { paginationSchema, createConversationSchema } from '@/lib/validations';

// list user conversations
export async function GET(req: Request) {
  const { session, error } = await authGuard();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const parsed = paginationSchema.safeParse({
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
  });
  const page = parsed.success ? parsed.data.page : 1;
  const limit = parsed.success ? parsed.data.limit : 20;

  const result = await getUserConversations(
    session.user.id,
    getPaginationParams(page, limit),
  );
  return NextResponse.json(result);
}

// create or find conversation
export async function POST(req: Request) {
  const { session, error } = await authGuard();
  if (error) return error;

  const body = await req.json();
  const parsed = createConversationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message },
      { status: 400 },
    );
  }

  try {
    const conversation = await findOrCreateConversation(
      session.user.id,
      parsed.data.participantId,
      parsed.data.bookingId,
    );
    return NextResponse.json({ conversation }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed';
    const status = msg.includes('disabled') ? 403 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
