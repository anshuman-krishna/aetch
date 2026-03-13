export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { rateLimit } from '@/backend/middleware/rate-limit';
import { sendMessage } from '@/backend/services/message-service';
import { sendMessageSchema } from '@/lib/validations';

export async function POST(req: Request) {
  const { session, error } = await authGuard();
  if (error) return error;

  // rate limit messages
  const rl = await rateLimit(session.user.id, 'message');
  if (!rl.success) return rl.error;

  const body = await req.json();
  const parsed = sendMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message },
      { status: 400 },
    );
  }

  try {
    const message = await sendMessage(
      parsed.data.conversationId,
      session.user.id,
      parsed.data.content,
    );
    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Send failed';
    const status = msg.includes('participant') ? 403 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
