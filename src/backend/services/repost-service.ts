import { prisma } from '@/lib/prisma';

const postInclude = {
  author: { select: { id: true, name: true, username: true, image: true } },
  tattoo: { select: { id: true, title: true, slug: true, imageUrl: true, thumbnailUrl: true } },
  _count: { select: { comments: true, likes: true } },
} as const;

// quote-tweet a post — creates a new Post pointing to the original via repostOfId
export async function repostPost(authorId: string, originalId: string, caption?: string) {
  const original = await prisma.post.findUnique({
    where: { id: originalId },
    select: { id: true, authorId: true },
  });
  if (!original) throw new Error('Post not found');
  if (original.authorId === authorId) {
    throw new Error('Cannot repost your own post');
  }

  const [repost] = await prisma.$transaction([
    prisma.post.create({
      data: {
        authorId,
        caption,
        repostOfId: originalId,
        tags: [],
      },
      include: {
        ...postInclude,
        repostOf: { include: postInclude },
      },
    }),
    prisma.post.update({
      where: { id: originalId },
      data: { repostsCount: { increment: 1 } },
    }),
  ]);

  return repost;
}

// undo a repost
export async function deleteRepost(authorId: string, repostId: string) {
  const repost = await prisma.post.findUnique({
    where: { id: repostId },
    select: { authorId: true, repostOfId: true },
  });
  if (!repost || repost.authorId !== authorId || !repost.repostOfId) {
    throw new Error('Repost not found');
  }
  await prisma.$transaction([
    prisma.post.delete({ where: { id: repostId } }),
    prisma.post.update({
      where: { id: repost.repostOfId },
      data: { repostsCount: { decrement: 1 } },
    }),
  ]);
}
