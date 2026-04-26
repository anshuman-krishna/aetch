import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function authGuard() {
  const session = await auth();

  if (!session?.user) {
    return {
      session: null as null,
      error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }),
    };
  }

  return { session, error: null as null };
}
