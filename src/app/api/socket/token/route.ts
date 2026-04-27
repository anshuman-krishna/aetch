export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { withErrorHandler } from '@/lib/api-error';
import { withRequestId } from '@/backend/middleware/request-log';
import { mintSocketToken } from '@/lib/socket-jwt';

// mint a short-lived bearer for the socket handshake.
// client calls this on connect + on reconnect.
export const GET = withErrorHandler(async (req: Request) => {
  const { session, error } = await authGuard();
  if (error) return withRequestId(req, error);

  const token = mintSocketToken(session.user.id);
  return withRequestId(
    req,
    NextResponse.json({ success: true, token, expiresIn: 60 }),
  );
}, 'GET /api/socket/token');
