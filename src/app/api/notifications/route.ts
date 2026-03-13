import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { getUserNotifications, getUnreadCount, markAllAsRead } from '@/backend/services/notification-service';

export async function GET(req: Request) {
  const { session, error } = await authGuard();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const countOnly = searchParams.get('count') === 'true';

  if (countOnly) {
    const count = await getUnreadCount(session.user.id);
    return NextResponse.json({ count });
  }

  const notifications = await getUserNotifications(session.user.id);
  return NextResponse.json({ notifications });
}

// mark all as read
export async function PATCH() {
  const { session, error } = await authGuard();
  if (error) return error;

  await markAllAsRead(session.user.id);
  return NextResponse.json({ success: true });
}
