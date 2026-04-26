export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { withErrorHandler } from '@/lib/api-error';
import { withRequestId } from '@/backend/middleware/request-log';
import { prisma } from '@/lib/prisma';
import { userSearchSchema } from '@/lib/validations';

// powers @mention autocomplete + people search
export const GET = withErrorHandler(async (req: Request) => {
  const { error } = await authGuard();
  if (error) return withRequestId(req, error);

  const { searchParams } = new URL(req.url);
  const parsed = userSearchSchema.safeParse({
    q: searchParams.get('q') ?? '',
    limit: searchParams.get('limit') ?? undefined,
  });
  if (!parsed.success) {
    return withRequestId(
      req,
      NextResponse.json({ success: false, error: 'Invalid query' }, { status: 400 }),
    );
  }

  const q = parsed.data.q.trim().replace(/^@/, '');
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { username: { contains: q, mode: 'insensitive' } },
        { name: { contains: q, mode: 'insensitive' } },
      ],
    },
    select: { id: true, username: true, name: true, image: true },
    orderBy: { username: 'asc' },
    take: parsed.data.limit,
  });

  return withRequestId(req, NextResponse.json({ success: true, users }));
}, 'GET /api/users/search');
