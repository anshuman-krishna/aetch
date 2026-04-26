export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { rateLimit } from '@/backend/middleware/rate-limit';
import { toggleFollow } from '@/backend/services/follow-service';
import { notifyNewFollower } from '@/backend/services/notification-service';

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(_req: Request, { params }: Params) {
  const { session, error } = await authGuard();
  if (error) return error;

  const rl = await rateLimit(session.user.id, 'api');
  if (!rl.success) return rl.error;

  const { id: followingId } = await params;

  if (session!.user.id === followingId) {
    return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
  }

  const result = await toggleFollow(session!.user.id, followingId);

  // notify on follow (non-blocking)
  if (result.following) {
    notifyNewFollower(followingId, session!.user.name ?? 'Someone').catch(() => {});
  }

  return NextResponse.json({ success: true, ...result });
}
