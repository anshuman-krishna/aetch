export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { withErrorHandler } from '@/lib/api-error';
import { withRequestId } from '@/backend/middleware/request-log';
import { prisma } from '@/lib/prisma';
import { generateSecret, otpauthUri } from '@/lib/totp';

// step 1: generate secret + otpauth uri (client renders qr)
export const POST = withErrorHandler(async (req: Request) => {
  const { session, error } = await authGuard();
  if (error) return withRequestId(req, error);

  const userRoles = session.user.roles ?? [];
  if (!userRoles.includes('ADMIN') && !userRoles.includes('SHOP_OWNER')) {
    return withRequestId(
      req,
      NextResponse.json(
        { success: false, error: '2fa is required only for ADMIN and SHOP_OWNER' },
        { status: 403 },
      ),
    );
  }

  const secret = generateSecret();
  // stage but do not enable until verify succeeds
  await prisma.user.update({
    where: { id: session.user.id },
    data: { totpSecret: secret, totpEnabledAt: null },
  });

  const account = session.user.email ?? session.user.username ?? session.user.id;
  const uri = otpauthUri({
    secret,
    account,
    issuer: process.env.TOTP_ISSUER ?? 'AETCH',
  });

  return withRequestId(req, NextResponse.json({ success: true, secret, otpauthUri: uri }));
}, 'POST /api/auth/totp/setup');
