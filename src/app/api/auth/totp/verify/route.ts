export const runtime = 'nodejs';

import { z } from 'zod';
import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { withErrorHandler } from '@/lib/api-error';
import { withRequestId } from '@/backend/middleware/request-log';
import { prisma } from '@/lib/prisma';
import { generateRecoveryCodes, verifyToken } from '@/lib/totp';
import { recordAuditEvent, clientContext } from '@/backend/services/audit-log-service';

const bodySchema = z.object({ token: z.string().regex(/^\d{6}$/) });

// step 2: verify token + commit enrollment
export const POST = withErrorHandler(async (req: Request) => {
  const { session, error } = await authGuard();
  if (error) return withRequestId(req, error);

  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return withRequestId(
      req,
      NextResponse.json({ success: false, error: 'Invalid token' }, { status: 400 }),
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { totpSecret: true },
  });
  if (!user?.totpSecret) {
    return withRequestId(
      req,
      NextResponse.json({ success: false, error: 'totp setup not started' }, { status: 400 }),
    );
  }

  if (!verifyToken(user.totpSecret, parsed.data.token)) {
    return withRequestId(
      req,
      NextResponse.json({ success: false, error: 'Invalid code' }, { status: 401 }),
    );
  }

  const recovery = generateRecoveryCodes();
  await prisma.user.update({
    where: { id: session.user.id },
    data: { totpEnabledAt: new Date(), totpRecoveryCodes: recovery },
  });

  await recordAuditEvent({
    actorId: session.user.id,
    action: 'TOTP_ENROLL',
    targetType: 'user',
    targetId: session.user.id,
    ...clientContext(req),
  });

  return withRequestId(req, NextResponse.json({ success: true, recoveryCodes: recovery }));
}, 'POST /api/auth/totp/verify');
