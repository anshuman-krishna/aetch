const post = {
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};
const $transaction = jest.fn().mockImplementation(async (ops) => Promise.all(ops));

jest.mock('@/lib/prisma', () => ({ prisma: { post, $transaction } }));

import { deleteRepost, repostPost } from '@/backend/services/repost-service';

beforeEach(() => jest.clearAllMocks());

describe('repostPost', () => {
  it('throws when original post missing', async () => {
    post.findUnique.mockResolvedValue(null);
    await expect(repostPost('u1', 'p1')).rejects.toThrow(/not found/i);
  });

  it('blocks reposting your own post', async () => {
    post.findUnique.mockResolvedValue({ id: 'p1', authorId: 'u1' });
    await expect(repostPost('u1', 'p1')).rejects.toThrow(/own post/i);
  });

  it('creates repost + increments parent count', async () => {
    post.findUnique.mockResolvedValue({ id: 'p1', authorId: 'someone-else' });
    post.create.mockResolvedValue({ id: 'r1' });
    post.update.mockResolvedValue({});
    await repostPost('u1', 'p1', 'cool');
    expect($transaction).toHaveBeenCalled();
    const ops = $transaction.mock.calls[0][0];
    expect(ops).toHaveLength(2);
    expect(post.create.mock.calls[0][0].data.repostOfId).toBe('p1');
    expect(post.create.mock.calls[0][0].data.caption).toBe('cool');
  });
});

describe('deleteRepost', () => {
  it('throws when not found / not owner / not a repost', async () => {
    post.findUnique.mockResolvedValueOnce(null);
    await expect(deleteRepost('u1', 'r1')).rejects.toThrow(/not found/i);

    post.findUnique.mockResolvedValueOnce({ authorId: 'someone-else', repostOfId: 'p1' });
    await expect(deleteRepost('u1', 'r1')).rejects.toThrow(/not found/i);

    post.findUnique.mockResolvedValueOnce({ authorId: 'u1', repostOfId: null });
    await expect(deleteRepost('u1', 'r1')).rejects.toThrow(/not found/i);
  });

  it('deletes + decrements parent count', async () => {
    post.findUnique.mockResolvedValue({ authorId: 'u1', repostOfId: 'p1' });
    post.delete.mockResolvedValue({});
    post.update.mockResolvedValue({});
    await deleteRepost('u1', 'r1');
    expect($transaction).toHaveBeenCalled();
  });
});
