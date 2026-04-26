export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { withErrorHandler } from '@/lib/api-error';
import { withRequestId } from '@/backend/middleware/request-log';
import { rateLimit } from '@/backend/middleware/rate-limit';
import { addCollectionItem, removeCollectionItem } from '@/backend/services/collection-service';
import { addToCollectionSchema } from '@/lib/validations';

interface Params {
  params: Promise<{ id: string }>;
}

export const POST = withErrorHandler(async (req: Request, ctx: unknown) => {
  const { params } = ctx as Params;
  const { session, error } = await authGuard();
  if (error) return withRequestId(req, error);

  const rl = await rateLimit(session.user.id, 'api');
  if (!rl.success) return withRequestId(req, rl.error);

  const { id: collectionId } = await params;
  const body = await req.json();
  const parsed = addToCollectionSchema.safeParse(body);
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
    const item = await addCollectionItem({
      collectionId,
      ownerId: session.user.id,
      ...parsed.data,
    });
    return withRequestId(req, NextResponse.json({ success: true, item }, { status: 201 }));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed';
    return withRequestId(req, NextResponse.json({ success: false, error: message }, { status: 404 }));
  }
}, 'POST /api/collections/[id]/items');

export const DELETE = withErrorHandler(async (req: Request, ctx: unknown) => {
  // /api/collections/[id]/items?itemId=...
  const { params } = ctx as Params;
  await params; // collectionId not actually needed — itemId scopes the row
  const { session, error } = await authGuard();
  if (error) return withRequestId(req, error);

  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get('itemId');
  if (!itemId) {
    return withRequestId(
      req,
      NextResponse.json({ success: false, error: 'itemId required' }, { status: 400 }),
    );
  }

  try {
    await removeCollectionItem(itemId, session.user.id);
    return withRequestId(req, NextResponse.json({ success: true }));
  } catch {
    return withRequestId(req, NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 }));
  }
}, 'DELETE /api/collections/[id]/items');
