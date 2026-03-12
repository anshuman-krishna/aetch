import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import type { UserRole } from '@prisma/client';

export async function requireRole(...roles: UserRole[]) {
  const session = await auth();

  if (!session?.user) {
    return {
      session: null as null,
      error: NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      ),
    };
  }

  if (!roles.includes(session.user.role as UserRole)) {
    return {
      session: null as null,
      error: NextResponse.json(
        { success: false, error: 'Forbidden: insufficient role' },
        { status: 403 },
      ),
    };
  }

  return { session, error: null as null };
}
