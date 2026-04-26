export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { requireRole } from '@/backend/middleware/role-guard';
import { withErrorHandler } from '@/lib/api-error';
import { withRequestId } from '@/backend/middleware/request-log';
import { prisma } from '@/lib/prisma';
import { paginationSchema } from '@/lib/validations';
import { getPaginationParams, buildPaginationMeta } from '@/utils/pagination';
import { recordAuditEvent, clientContext } from '@/backend/services/audit-log-service';

// list users (admin only)
export const GET = withErrorHandler(async (req: Request) => {
  const { error } = await requireRole('ADMIN');
  if (error) return withRequestId(req, error);

  const { searchParams } = new URL(req.url);
  const page = paginationSchema.safeParse({
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
  });
  const pagination = getPaginationParams(
    page.success ? page.data.page : 1,
    page.success ? page.data.limit : 20,
  );

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        image: true,
        roles: true,
        onboardingComplete: true,
        createdAt: true,
        totpEnabledAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.user.count(),
  ]);

  return withRequestId(
    req,
    NextResponse.json({
      success: true,
      users,
      pagination: buildPaginationMeta(total, pagination),
    }),
  );
}, 'GET /api/admin/users');

// disable user (admin only)
export const PATCH = withErrorHandler(async (req: Request) => {
  const { session, error } = await requireRole('ADMIN');
  if (error) return withRequestId(req, error);

  const body = await req.json();
  const { userId, disabled } = body;

  if (!userId || typeof disabled !== 'boolean') {
    return withRequestId(
      req,
      NextResponse.json({ success: false, error: 'userId and disabled required' }, { status: 400 }),
    );
  }

  // remove all roles to disable
  if (disabled) {
    await prisma.user.update({
      where: { id: userId },
      data: { roles: [] },
    });
  }

  await recordAuditEvent({
    actorId: session.user.id,
    action: disabled ? 'USER_DISABLE' : 'USER_ENABLE',
    targetType: 'user',
    targetId: userId,
    metadata: { disabled },
    ...clientContext(req),
  });

  return withRequestId(req, NextResponse.json({ success: true }));
}, 'PATCH /api/admin/users');
