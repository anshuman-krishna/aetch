export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { requireRole } from '@/backend/middleware/role-guard';
import { prisma } from '@/lib/prisma';
import { paginationSchema } from '@/lib/validations';
import { getPaginationParams, buildPaginationMeta } from '@/utils/pagination';

// list users (admin only)
export async function GET(req: Request) {
  const { error } = await requireRole('ADMIN');
  if (error) return error;

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
      },
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.user.count(),
  ]);

  return NextResponse.json({
    success: true,
    users,
    pagination: buildPaginationMeta(total, pagination),
  });
}

// disable user (admin only)
export async function PATCH(req: Request) {
  const { error } = await requireRole('ADMIN');
  if (error) return error;

  const body = await req.json();
  const { userId, disabled } = body;

  if (!userId || typeof disabled !== 'boolean') {
    return NextResponse.json(
      { success: false, error: 'userId and disabled required' },
      { status: 400 },
    );
  }

  // remove all roles to disable
  if (disabled) {
    await prisma.user.update({
      where: { id: userId },
      data: { roles: [] },
    });
  }

  return NextResponse.json({ success: true });
}
