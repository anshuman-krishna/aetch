export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { withErrorHandler } from '@/lib/api-error';
import { withRequestId } from '@/backend/middleware/request-log';
import { prisma } from '@/lib/prisma';

export const POST = withErrorHandler(async (req: Request) => {
  const { session, error } = await authGuard();
  if (error) return withRequestId(req, error);

  const { endpoint } = await req.json();
  if (typeof endpoint !== 'string') {
    return withRequestId(
      req,
      NextResponse.json({ success: false, error: 'endpoint required' }, { status: 400 }),
    );
  }
  await prisma.pushSubscription.deleteMany({
    where: { endpoint, userId: session.user.id },
  });
  return withRequestId(req, NextResponse.json({ success: true }));
}, 'POST /api/push/unsubscribe');
