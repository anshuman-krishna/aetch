export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { getUnreadMessageCount } from '@/backend/services/message-service';

export async function GET() {
  const { session, error } = await authGuard();
  if (error) return error;

  const count = await getUnreadMessageCount(session.user.id);
  return NextResponse.json({ count });
}
