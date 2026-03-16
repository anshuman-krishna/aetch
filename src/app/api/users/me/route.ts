export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { rateLimit } from '@/backend/middleware/rate-limit';
import { prisma } from '@/lib/prisma';
import { updateProfileSchema } from '@/lib/validations';

// get current user profile
export async function GET() {
  const { session, error } = await authGuard();
  if (error) return error;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      image: true,
      bio: true,
      roles: true,
      favoriteStyles: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ success: true, user });
}

// update current user profile
export async function PATCH(req: Request) {
  const { session, error } = await authGuard();
  if (error) return error;

  const rl = await rateLimit(session.user.id, 'api');
  if (!rl.success) return rl.error;

  const body = await req.json();
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  // check username uniqueness
  if (parsed.data.username) {
    const existing = await prisma.user.findFirst({
      where: {
        username: parsed.data.username,
        id: { not: session.user.id },
      },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Username is already taken' },
        { status: 409 },
      );
    }
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
    select: {
      id: true,
      name: true,
      username: true,
      bio: true,
      image: true,
    },
  });

  return NextResponse.json({ success: true, user });
}
