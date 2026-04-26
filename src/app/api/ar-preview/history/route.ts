export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { getUserPreviews } from '@/backend/services/ar-preview-service';
import { getPaginationParams } from '@/utils/pagination';
import { paginationSchema } from '@/lib/validations';

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
  const pagination = getPaginationParams(page, limit);

  const result = await getUserPreviews(session!.user.id, pagination);
  return NextResponse.json(result);
}
