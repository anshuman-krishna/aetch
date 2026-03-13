import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { getUserPreviews } from '@/backend/services/ar-preview-service';
import { getPaginationParams } from '@/utils/pagination';

export async function GET(req: Request) {
  const { session, error } = await authGuard();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get('page') ?? 1);
  const limit = Number(searchParams.get('limit') ?? 20);
  const pagination = getPaginationParams(page, limit);

  const result = await getUserPreviews(session!.user.id, pagination);
  return NextResponse.json(result);
}
