import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import type { UserRole } from '@prisma/client';

// check if user has any required role
export async function requireRole(...roles: UserRole[]) {
  const session = await auth();

  if (!session?.user) {
    return {
      session: null as null,
      error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const userRoles = session.user.roles ?? [];
  const hasRole = roles.some((r) => userRoles.includes(r));

  if (!hasRole) {
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
