export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { withErrorHandler } from '@/lib/api-error';
import { withRequestId } from '@/backend/middleware/request-log';
import { listOnlineUsers, isUserOnline } from '@/backend/realtime/socket-server';

// presence — list every online user, or check a specific id with ?ids=a,b,c
export const GET = withErrorHandler(async (req: Request) => {
  const { error } = await authGuard();
  if (error) return withRequestId(req, error);

  const { searchParams } = new URL(req.url);
  const ids = searchParams.get('ids');

  if (ids) {
    const requested = ids.split(',').slice(0, 100);
    const status: Record<string, boolean> = {};
    for (const id of requested) status[id] = isUserOnline(id);
    return withRequestId(req, NextResponse.json({ success: true, status }));
  }

  return withRequestId(req, NextResponse.json({ success: true, online: listOnlineUsers() }));
}, 'GET /api/users/online');
