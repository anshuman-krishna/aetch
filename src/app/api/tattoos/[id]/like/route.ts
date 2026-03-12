import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { toggleLike } from '@/backend/services/tattoo-service';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, error } = await authGuard();
  if (error) return error;

  const { id } = await params;
  const result = await toggleLike(session!.user.id, id);

  return NextResponse.json({ success: true, ...result });
}
