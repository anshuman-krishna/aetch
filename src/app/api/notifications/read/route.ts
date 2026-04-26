export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { withErrorHandler } from '@/lib/api-error';
import { withRequestId } from '@/backend/middleware/request-log';
import { markAsRead } from '@/backend/services/notification-service';

// mark single notification as read
export const PATCH = withErrorHandler(async (req: Request) => {
  const { session, error } = await authGuard();
  if (error) return withRequestId(req, error);

  const body = await req.json();
  const { notificationId } = body;

  if (!notificationId || typeof notificationId !== 'string') {
    return withRequestId(
      req,
      NextResponse.json({ success: false, error: 'notificationId required' }, { status: 400 }),
    );
  }

  await markAsRead(notificationId, session.user.id);
  return withRequestId(req, NextResponse.json({ success: true }));
}, 'PATCH /api/notifications/read');
