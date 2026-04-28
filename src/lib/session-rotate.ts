import { prisma } from '@/lib/prisma';

// terminate all active sessions for a user — call after role change so the
// next request must re-auth and pick up new role grants.
export async function rotateUserSessions(userId: string): Promise<number> {
  const result = await prisma.session.deleteMany({ where: { userId } });
  return result.count;
}
