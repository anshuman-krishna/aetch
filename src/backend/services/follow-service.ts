import { prisma } from '@/lib/prisma';
import { type PaginationParams, buildPaginationMeta } from '@/utils/pagination';

// shared user select
const userSelect = {
  id: true,
  name: true,
  username: true,
  image: true,
  role: true,
} as const;

export async function toggleFollow(followerId: string, followingId: string) {
  if (followerId === followingId) {
    throw new Error('Cannot follow yourself');
  }

  const existing = await prisma.follower.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  });

  if (existing) {
    await prisma.follower.delete({ where: { id: existing.id } });
    return { following: false };
  }

  await prisma.follower.create({
    data: { followerId, followingId },
  });
  return { following: true };
}

export async function isFollowing(followerId: string, followingId: string) {
  const record = await prisma.follower.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
    select: { id: true },
  });
  return !!record;
}

export async function getFollowers(userId: string, pagination: PaginationParams) {
  const where = { followingId: userId };
  const [followers, total] = await Promise.all([
    prisma.follower.findMany({
      where,
      include: { follower: { select: userSelect } },
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.follower.count({ where }),
  ]);
  return {
    users: followers.map((f) => f.follower),
    pagination: buildPaginationMeta(total, pagination),
  };
}

export async function getFollowing(userId: string, pagination: PaginationParams) {
  const where = { followerId: userId };
  const [following, total] = await Promise.all([
    prisma.follower.findMany({
      where,
      include: { following: { select: userSelect } },
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.follower.count({ where }),
  ]);
  return {
    users: following.map((f) => f.following),
    pagination: buildPaginationMeta(total, pagination),
  };
}
