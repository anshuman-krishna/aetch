export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { rateLimit } from '@/backend/middleware/rate-limit';
import { prisma } from '@/lib/prisma';
import { createReportSchema } from '@/lib/validations';

// submit content report
export async function POST(req: Request) {
  const { session, error } = await authGuard();
  if (error) return error;

  const rl = await rateLimit(session.user.id, 'api');
  if (!rl.success) return rl.error;

  const body = await req.json();
  const parsed = createReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  // prevent duplicate reports
  const existing = await prisma.report.findFirst({
    where: {
      reporterId: session.user.id,
      targetType: parsed.data.targetType,
      targetId: parsed.data.targetId,
      status: 'PENDING',
    },
  });

  if (existing) {
    return NextResponse.json({ success: false, error: 'Already reported' }, { status: 409 });
  }

  const report = await prisma.report.create({
    data: {
      reporterId: session.user.id,
      ...parsed.data,
    },
  });

  return NextResponse.json({ success: true, report }, { status: 201 });
}
