export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { requireRole } from '@/backend/middleware/role-guard';
import { withErrorHandler } from '@/lib/api-error';
import { withRequestId } from '@/backend/middleware/request-log';
import { deleteTattoo } from '@/backend/services/tattoo-service';
import { recordAuditEvent, clientContext } from '@/backend/services/audit-log-service';

// delete tattoo (admin only)
export const DELETE = withErrorHandler(async (req: Request) => {
  const { session, error } = await requireRole('ADMIN');
  if (error) return withRequestId(req, error);

  const { searchParams } = new URL(req.url);
  const tattooId = searchParams.get('id');

  if (!tattooId) {
    return withRequestId(
      req,
      NextResponse.json({ success: false, error: 'Tattoo ID required' }, { status: 400 }),
    );
  }

  await deleteTattoo(tattooId);
  await recordAuditEvent({
    actorId: session.user.id,
    action: 'TATTOO_REMOVE',
    targetType: 'tattoo',
    targetId: tattooId,
    ...clientContext(req),
  });
  return withRequestId(req, NextResponse.json({ success: true }));
}, 'DELETE /api/admin/tattoos');
