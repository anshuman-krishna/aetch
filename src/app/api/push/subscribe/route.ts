export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { withErrorHandler } from '@/lib/api-error';
import { withRequestId } from '@/backend/middleware/request-log';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { pushSubscribeSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';

export const POST = withErrorHandler(async (req: Request) => {
  if (!isFeatureEnabled('WEB_PUSH_ENABLED')) {
    return withRequestId(
      req,
      NextResponse.json({ success: false, error: 'Web push disabled' }, { status: 403 }),
    );
  }
  const { session, error } = await authGuard();
  if (error) return withRequestId(req, error);

  const body = await req.json();
  const parsed = pushSubscribeSchema.safeParse(body);
  if (!parsed.success) {
    return withRequestId(
      req,
      NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 },
      ),
    );
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint: parsed.data.endpoint },
    create: {
      userId: session.user.id,
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.keys.p256dh,
      authKey: parsed.data.keys.auth,
      userAgent: parsed.data.userAgent,
    },
    update: {
      userId: session.user.id,
      p256dh: parsed.data.keys.p256dh,
      authKey: parsed.data.keys.auth,
      userAgent: parsed.data.userAgent,
    },
  });

  return withRequestId(req, NextResponse.json({ success: true }));
}, 'POST /api/push/subscribe');
