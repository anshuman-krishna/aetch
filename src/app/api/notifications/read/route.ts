export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { markAsRead } from '@/backend/services/notification-service';

// mark single notification as read
export async function PATCH(req: Request) {
  const { session, error } = await authGuard();
  if (error) return error;

  const body = await req.json();
  const { notificationId } = body;

  if (!notificationId || typeof notificationId !== 'string') {
    return NextResponse.json(
      { success: false, error: 'notificationId required' },
      { status: 400 },
    );
  }

  await markAsRead(notificationId, session.user.id);
  return NextResponse.json({ success: true });
}
