const comment = {
  create: jest.fn(),
  findMany: jest.fn(),
  findUnique: jest.fn(),
  delete: jest.fn(),
};
const post = { update: jest.fn() };
const $transaction = jest.fn().mockImplementation(async (ops) => Promise.all(ops));

jest.mock('@/lib/prisma', () => ({
  prisma: { comment, post, $transaction },
}));

import { createComment, deleteComment, getPostComments } from '@/backend/services/comment-service';

beforeEach(() => jest.clearAllMocks());

describe('createComment', () => {
  it('creates comment + increments post.commentsCount in one tx', async () => {
    comment.create.mockResolvedValue({ id: 'c1' });
    post.update.mockResolvedValue({ id: 'p1' });
    const result = await createComment({
      authorId: 'u1',
      postId: 'p1',
      content: 'nice',
    });
    expect(result).toEqual({ id: 'c1' });
    expect($transaction).toHaveBeenCalledTimes(1);
    expect($transaction.mock.calls[0][0]).toHaveLength(2);
  });

  it('forwards parentId when provided', async () => {
    comment.create.mockResolvedValue({ id: 'c2' });
    await createComment({
      authorId: 'u1',
      postId: 'p1',
      content: 'reply',
      parentId: 'c1',
    });
    expect(comment.create.mock.calls[0][0].data.parentId).toBe('c1');
  });
});

describe('getPostComments', () => {
  it('only returns top-level comments (parentId null)', async () => {
    comment.findMany.mockResolvedValue([]);
    await getPostComments('p1');
    expect(comment.findMany.mock.calls[0][0].where).toEqual({
      postId: 'p1',
      parentId: null,
    });
  });
});

describe('deleteComment', () => {
  it('returns null when comment not found / not author', async () => {
    comment.findUnique.mockResolvedValue(null);
    const result = await deleteComment('c1', 'u1');
    expect(result).toBeNull();
    expect($transaction).not.toHaveBeenCalled();
  });

  it('deletes + decrements when found', async () => {
    comment.findUnique.mockResolvedValue({ postId: 'p1' });
    comment.delete.mockResolvedValue({ id: 'c1' });
    post.update.mockResolvedValue({});
    await deleteComment('c1', 'u1');
    expect($transaction).toHaveBeenCalled();
  });
});
