export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-error';
import { withRequestId } from '@/backend/middleware/request-log';
import { requireRole } from '@/backend/middleware/role-guard';
import { createEventSchema, paginationSchema } from '@/lib/validations';
import { createEvent, listUpcomingEvents } from '@/backend/services/event-service';
import { getPaginationParams } from '@/utils/pagination';

export const GET = withErrorHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const parsed = paginationSchema.safeParse({
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
  });
  const pagination = getPaginationParams(
    parsed.success ? parsed.data.page : 1,
    parsed.success ? parsed.data.limit : 20,
  );
  const data = await listUpcomingEvents(pagination);
  return withRequestId(req, NextResponse.json({ success: true, ...data }));
}, 'GET /api/events');

// admin-only event creation for now — public-facing convention listings later
export const POST = withErrorHandler(async (req: Request) => {
  const { error } = await requireRole('ADMIN');
  if (error) return withRequestId(req, error);

  const body = await req.json();
  const parsed = createEventSchema.safeParse(body);
  if (!parsed.success) {
    return withRequestId(
      req,
      NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 },
      ),
    );
  }
  const event = await createEvent({
    ...parsed.data,
    startsAt: new Date(parsed.data.startsAt),
    endsAt: new Date(parsed.data.endsAt),
  });
  return withRequestId(req, NextResponse.json({ success: true, event }, { status: 201 }));
}, 'POST /api/events');
