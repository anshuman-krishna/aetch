export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { withErrorHandler } from '@/lib/api-error';
import { withRequestId } from '@/backend/middleware/request-log';
import { rateLimit } from '@/backend/middleware/rate-limit';
import {
  createCollection,
  getCollectionsForOwner,
} from '@/backend/services/collection-service';
import { createCollectionSchema, paginationSchema } from '@/lib/validations';
import { getPaginationParams } from '@/utils/pagination';

export const GET = withErrorHandler(async (req: Request) => {
  const { session, error } = await authGuard();
  if (error) return withRequestId(req, error);

  const { searchParams } = new URL(req.url);
  const page = paginationSchema.safeParse({
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
  });
  const pagination = getPaginationParams(
    page.success ? page.data.page : 1,
    page.success ? page.data.limit : 20,
  );

  const result = await getCollectionsForOwner(session.user.id, pagination);
  return withRequestId(req, NextResponse.json({ success: true, ...result }));
}, 'GET /api/collections');

export const POST = withErrorHandler(async (req: Request) => {
  const { session, error } = await authGuard();
  if (error) return withRequestId(req, error);

  const rl = await rateLimit(session.user.id, 'api');
  if (!rl.success) return withRequestId(req, rl.error);

  const body = await req.json();
  const parsed = createCollectionSchema.safeParse(body);
  if (!parsed.success) {
    return withRequestId(
      req,
      NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 },
      ),
    );
  }

  try {
    const collection = await createCollection({
      ownerId: session.user.id,
      ...parsed.data,
    });
    return withRequestId(req, NextResponse.json({ success: true, collection }, { status: 201 }));
  } catch {
    // p2002 unique violation on (ownerId, slug)
    return withRequestId(
      req,
      NextResponse.json(
        { success: false, error: 'Collection with that slug already exists' },
        { status: 409 },
      ),
    );
  }
}, 'POST /api/collections');
