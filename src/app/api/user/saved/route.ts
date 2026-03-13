export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { getSavedTattoos } from '@/backend/services/tattoo-service';
import { paginationSchema } from '@/lib/validations';
import { getPaginationParams } from '@/utils/pagination';

export async function GET(req: NextRequest) {
  const { session, error } = await authGuard();
  if (error) return error;

  const searchParams = req.nextUrl.searchParams;
  const paginationResult = paginationSchema.safeParse({
    page: searchParams.get('page') ?? 1,
    limit: searchParams.get('limit') ?? 20,
  });

  const { page, limit } = paginationResult.success
    ? paginationResult.data
    : { page: 1, limit: 20 };

  const pagination = getPaginationParams(page, limit);
  const result = await getSavedTattoos(session!.user.id, pagination);

  return NextResponse.json({ success: true, ...result });
}
