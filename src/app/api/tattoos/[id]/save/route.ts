export const runtime = "nodejs";

import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { rateLimit } from '@/backend/middleware/rate-limit';
import { saveTattoo } from '@/backend/services/tattoo-service';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, error } = await authGuard();
  if (error) return error;

  const rl = await rateLimit(session.user.id, 'api');
  if (!rl.success) return rl.error;

  const { id } = await params;
  const result = await saveTattoo(session!.user.id, id);

  return NextResponse.json({ success: true, ...result });
}
