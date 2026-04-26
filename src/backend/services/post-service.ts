import { prisma } from '@/lib/prisma';
import { type PaginationParams, buildPaginationMeta } from '@/utils/pagination';
import type { Prisma } from '@prisma/client';

// shared post include
const postInclude = {
  author: {
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
    },
  },
  tattoo: {
    select: {
      id: true,
      title: true,
      slug: true,
      imageUrl: true,
      thumbnailUrl: true,
    },
  },
  _count: { select: { comments: true, likes: true } },
} satisfies Prisma.PostInclude;

export async function createPost(data: {
  authorId: string;
  caption?: string;
  imageUrl?: string;
  tattooId?: string;
  tags?: string[];
}) {
  return prisma.post.create({
    data: {
      authorId: data.authorId,
      caption: data.caption,
      imageUrl: data.imageUrl,
      tattooId: data.tattooId,
      tags: data.tags ?? [],
    },
    include: postInclude,
  });
}

export async function getPostById(id: string) {
  return prisma.post.findUnique({
    where: { id },
    include: postInclude,
  });
}

export async function deletePost(postId: string, authorId: string) {
  return prisma.post.delete({
    where: { id: postId, authorId },
  });
}

// feed: latest posts
export async function getLatestPosts(pagination: PaginationParams) {
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      include: postInclude,
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.post.count(),
  ]);
  return { posts, pagination: buildPaginationMeta(total, pagination) };
}

// following users feed
export async function getFollowingFeed(userId: string, pagination: PaginationParams) {
  const following = await prisma.follower.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });
  const ids = following.map((f) => f.followingId);
  ids.push(userId);

  const where: Prisma.PostWhereInput = { authorId: { in: ids } };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: postInclude,
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.post.count({ where }),
  ]);
  return { posts, pagination: buildPaginationMeta(total, pagination) };
}

// posts tagged with a specific hashtag (case-insensitive)
export async function getPostsByTag(tag: string, pagination: PaginationParams) {
  const normalized = tag.toLowerCase();
  const where: Prisma.PostWhereInput = { tags: { has: normalized } };
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: postInclude,
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.post.count({ where }),
  ]);
  return { posts, pagination: buildPaginationMeta(total, pagination), tag: normalized };
}

// trending posts feed
export async function getTrendingPosts(pagination: PaginationParams) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const where: Prisma.PostWhereInput = {
    createdAt: { gte: sevenDaysAgo },
  };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: postInclude,
      orderBy: [{ likesCount: 'desc' }, { commentsCount: 'desc' }, { createdAt: 'desc' }],
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.post.count({ where }),
  ]);
  return { posts, pagination: buildPaginationMeta(total, pagination) };
}

// user posts
export async function getUserPosts(userId: string, pagination: PaginationParams) {
  const where: Prisma.PostWhereInput = { authorId: userId };
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: postInclude,
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.post.count({ where }),
  ]);
  return { posts, pagination: buildPaginationMeta(total, pagination) };
}

// toggle post like
export async function togglePostLike(userId: string, postId: string) {
  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.like.delete({ where: { id: existing.id } }),
      prisma.post.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } },
      }),
    ]);
    return { liked: false };
  }

  await prisma.$transaction([
    prisma.like.create({ data: { userId, postId } }),
    prisma.post.update({
      where: { id: postId },
      data: { likesCount: { increment: 1 } },
    }),
  ]);
  return { liked: true };
}

// check post like status
export async function isPostLikedByUser(userId: string, postId: string) {
  const like = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId } },
    select: { id: true },
  });
  return !!like;
}

// user liked posts
export async function getUserLikedPosts(userId: string, pagination: PaginationParams) {
  const where = { userId, postId: { not: null } };
  const [likes, total] = await Promise.all([
    prisma.like.findMany({
      where,
      include: {
        post: { include: postInclude },
      },
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.like.count({ where }),
  ]);
  return {
    posts: likes.map((l) => l.post!).filter(Boolean),
    pagination: buildPaginationMeta(total, pagination),
  };
}
