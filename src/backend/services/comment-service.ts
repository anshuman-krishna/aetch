import { prisma } from '@/lib/prisma';

// shared comment include
const commentInclude = {
  author: {
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
    },
  },
} as const;

export async function createComment(data: {
  authorId: string;
  postId: string;
  content: string;
  parentId?: string;
}) {
  const [comment] = await prisma.$transaction([
    prisma.comment.create({
      data: {
        authorId: data.authorId,
        postId: data.postId,
        content: data.content,
        parentId: data.parentId,
      },
      include: commentInclude,
    }),
    prisma.post.update({
      where: { id: data.postId },
      data: { commentsCount: { increment: 1 } },
    }),
  ]);
  return comment;
}

export async function getPostComments(postId: string) {
  return prisma.comment.findMany({
    where: { postId, parentId: null },
    include: {
      ...commentInclude,
      replies: {
        include: commentInclude,
        orderBy: { createdAt: 'asc' },
        take: 5,
      },
      _count: { select: { replies: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function deleteComment(commentId: string, authorId: string) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId, authorId },
    select: { postId: true },
  });
  if (!comment) return null;

  const [deleted] = await prisma.$transaction([
    prisma.comment.delete({ where: { id: commentId } }),
    prisma.post.update({
      where: { id: comment.postId },
      data: { commentsCount: { decrement: 1 } },
    }),
  ]);
  return deleted;
}
