export const runtime = 'nodejs';

import { z } from 'zod';
import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { withErrorHandler } from '@/lib/api-error';
import { withRequestId } from '@/backend/middleware/request-log';
import { prisma } from '@/lib/prisma';
import { consumeRecoveryCode, verifyToken } from '@/lib/totp';
import { recordAuditEvent, clientContext } from '@/backend/services/audit-log-service';

const bodySchema = z.object({
  token: z.string().min(6).max(20),
});

// disable 2fa - accepts current totp or a recovery code
export const POST = withErrorHandler(async (req: Request) => {
  const { session, error } = await authGuard();
  if (error) return withRequestId(req, error);

  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return withRequestId(
      req,
      NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 }),
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { totpSecret: true, totpRecoveryCodes: true, totpEnabledAt: true },
  });
  if (!user?.totpEnabledAt || !user.totpSecret) {
    return withRequestId(
      req,
      NextResponse.json({ success: false, error: '2fa not enabled' }, { status: 400 }),
    );
  }

  const submitted = parsed.data.token;
  const isTotp = /^\d{6}$/.test(submitted) && verifyToken(user.totpSecret, submitted);
  const remaining = isTotp ? null : consumeRecoveryCode(user.totpRecoveryCodes, submitted);
  if (!isTotp && remaining === null) {
    return withRequestId(
      req,
      NextResponse.json({ success: false, error: 'Invalid code' }, { status: 401 }),
    );
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { totpSecret: null, totpEnabledAt: null, totpRecoveryCodes: [] },
  });

  await recordAuditEvent({
    actorId: session.user.id,
    action: 'TOTP_DISABLE',
    targetType: 'user',
    targetId: session.user.id,
    ...clientContext(req),
  });

  return withRequestId(req, NextResponse.json({ success: true }));
}, 'POST /api/auth/totp/disable');
