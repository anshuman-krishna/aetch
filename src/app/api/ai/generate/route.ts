export const runtime = "nodejs";

import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { rateLimit } from '@/backend/middleware/rate-limit';
import { generateTattooDesign } from '@/backend/services/ai-service';
import { aiGenerateSchema } from '@/lib/validations';

export async function POST(req: Request) {
  const { session, error } = await authGuard();
  if (error) return error;

  // rate limit ai generation
  const rl = await rateLimit(session!.user.id, 'ai-generation');
  if (!rl.success) return rl.error;

  const body = await req.json();
  const parsed = aiGenerateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    );
  }

  try {
    const generation = await generateTattooDesign({
      userId: session!.user.id,
      ...parsed.data,
    });
    return NextResponse.json({ generation }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Generation failed';
    const status = message.includes('limit') || message.includes('disabled') ? 429 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
