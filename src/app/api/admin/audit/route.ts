export const runtime = 'nodejs';

import { z } from 'zod';
import { NextResponse } from 'next/server';
import { requireRole } from '@/backend/middleware/role-guard';
import { withErrorHandler } from '@/lib/api-error';
import { withRequestId } from '@/backend/middleware/request-log';
import { listAuditEvents } from '@/backend/services/audit-log-service';
import { paginationSchema } from '@/lib/validations';
import { getPaginationParams } from '@/utils/pagination';

const ACTIONS = [
  'USER_DISABLE',
  'USER_ENABLE',
  'USER_ROLE_CHANGE',
  'POST_REMOVE',
  'TATTOO_REMOVE',
  'COMMENT_REMOVE',
  'REPORT_RESOLVE',
  'REPORT_DISMISS',
  'ARTIST_VERIFY',
  'SHOP_VERIFY',
  'TOTP_ENROLL',
  'TOTP_DISABLE',
] as const;

const filterSchema = z.object({
  actorId: z.string().cuid().optional(),
  targetId: z.string().optional(),
  action: z.enum(ACTIONS).optional(),
});

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
    page.success ? page.data.limit : 50,
  );

  const filters = filterSchema.safeParse({
    actorId: searchParams.get('actorId') ?? undefined,
    targetId: searchParams.get('targetId') ?? undefined,
    action: searchParams.get('action') ?? undefined,
  });

  const { events, pagination: meta } = await listAuditEvents(
    filters.success ? filters.data : {},
    pagination,
  );

  return withRequestId(req, NextResponse.json({ success: true, events, pagination: meta }));
}, 'GET /api/admin/audit');
