export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { withErrorHandler } from '@/lib/api-error';
import { withRequestId } from '@/backend/middleware/request-log';
import {
  getUserNotifications,
  getUnreadCount,
  markAllAsRead,
} from '@/backend/services/notification-service';

export const GET = withErrorHandler(async (req: Request) => {
  const { session, error } = await authGuard();
  if (error) return withRequestId(req, error);

  const { searchParams } = new URL(req.url);
  const countOnly = searchParams.get('count') === 'true';

  if (countOnly) {
    const count = await getUnreadCount(session.user.id);
    return withRequestId(req, NextResponse.json({ count }));
  }

  const notifications = await getUserNotifications(session.user.id);
  return withRequestId(req, NextResponse.json({ notifications }));
}, 'GET /api/notifications');

// mark all as read
export const PATCH = withErrorHandler(async (req: Request) => {
  const { session, error } = await authGuard();
  if (error) return withRequestId(req, error);

  await markAllAsRead(session.user.id);
  return withRequestId(req, NextResponse.json({ success: true }));
}, 'PATCH /api/notifications');
