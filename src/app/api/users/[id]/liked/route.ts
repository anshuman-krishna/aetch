export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getUserLikedPosts } from '@/backend/services/post-service';
import { getPaginationParams } from '@/utils/pagination';
import { paginationSchema } from '@/lib/validations';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: Params) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);

  const parsed = paginationSchema.safeParse({
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
  });
  const page = parsed.success ? parsed.data.page : 1;
  const limit = parsed.success ? parsed.data.limit : 20;

  const result = await getUserLikedPosts(id, getPaginationParams(page, limit));
  return NextResponse.json(result);
}
