export const runtime = "nodejs";

import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { getGenerationById } from '@/backend/services/ai-service';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Params) {
  const { session, error } = await authGuard();
  if (error) return error;

  const { id } = await params;
  const generation = await getGenerationById(id);

  if (!generation || generation.userId !== session!.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ generation });
}
