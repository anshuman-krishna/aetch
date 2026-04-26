const post = {
  create: jest.fn(),
  findUnique: jest.fn(),
  findMany: jest.fn(),
  count: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};
const like = {
  findUnique: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
  findMany: jest.fn(),
  count: jest.fn(),
};
const follower = { findMany: jest.fn() };
const $transaction = jest.fn().mockImplementation(async (ops) => Promise.all(ops));

jest.mock('@/lib/prisma', () => ({
  prisma: { post, like, follower, $transaction },
}));

import {
  createPost,
  deletePost,
  getFollowingFeed,
  getLatestPosts,
  getTrendingPosts,
  getUserLikedPosts,
  getUserPosts,
  isPostLikedByUser,
  togglePostLike,
} from '@/backend/services/post-service';

beforeEach(() => jest.clearAllMocks());

describe('createPost', () => {
  it('defaults tags to []', async () => {
    post.create.mockResolvedValue({ id: 'p1' });
    await createPost({ authorId: 'u1' });
    expect(post.create.mock.calls[0][0].data.tags).toEqual([]);
  });

  it('forwards tags when provided', async () => {
    post.create.mockResolvedValue({ id: 'p2' });
    await createPost({ authorId: 'u1', tags: ['neo', 'sleeve'] });
    expect(post.create.mock.calls[0][0].data.tags).toEqual(['neo', 'sleeve']);
  });
});

describe('feeds', () => {
  it('latest sorts createdAt desc', async () => {
    post.findMany.mockResolvedValue([]);
    post.count.mockResolvedValue(0);
    await getLatestPosts({ page: 1, limit: 10, skip: 0 });
    expect(post.findMany.mock.calls[0][0].orderBy).toEqual({ createdAt: 'desc' });
  });

  it('following feed includes self + followed users', async () => {
    follower.findMany.mockResolvedValue([{ followingId: 'a' }, { followingId: 'b' }]);
    post.findMany.mockResolvedValue([]);
    post.count.mockResolvedValue(0);
    await getFollowingFeed('me', { page: 1, limit: 10, skip: 0 });
    const where = post.findMany.mock.calls[0][0].where;
    expect(new Set(where.authorId.in)).toEqual(new Set(['a', 'b', 'me']));
  });

  it('trending sorts by likes,comments,date', async () => {
    post.findMany.mockResolvedValue([]);
    post.count.mockResolvedValue(0);
    await getTrendingPosts({ page: 1, limit: 10, skip: 0 });
    expect(post.findMany.mock.calls[0][0].orderBy).toEqual([
      { likesCount: 'desc' },
      { commentsCount: 'desc' },
      { createdAt: 'desc' },
    ]);
  });

  it('user posts filters by authorId', async () => {
    post.findMany.mockResolvedValue([]);
    post.count.mockResolvedValue(0);
    await getUserPosts('u1', { page: 1, limit: 10, skip: 0 });
    expect(post.findMany.mock.calls[0][0].where.authorId).toBe('u1');
  });
});

describe('togglePostLike', () => {
  it('adds like + increments when no existing like', async () => {
    like.findUnique.mockResolvedValue(null);
    const result = await togglePostLike('u1', 'p1');
    expect(result).toEqual({ liked: true });
    expect($transaction).toHaveBeenCalled();
    const ops = $transaction.mock.calls[0][0];
    expect(ops).toHaveLength(2);
  });

  it('removes like + decrements when existing', async () => {
    like.findUnique.mockResolvedValue({ id: 'l1' });
    const result = await togglePostLike('u1', 'p1');
    expect(result).toEqual({ liked: false });
  });
});

describe('isPostLikedByUser', () => {
  it('returns true when like row exists', async () => {
    like.findUnique.mockResolvedValue({ id: 'l1' });
    expect(await isPostLikedByUser('u1', 'p1')).toBe(true);
  });
  it('returns false when no like row', async () => {
    like.findUnique.mockResolvedValue(null);
    expect(await isPostLikedByUser('u1', 'p1')).toBe(false);
  });
});

describe('getUserLikedPosts', () => {
  it('flattens like.post into posts list', async () => {
    like.findMany.mockResolvedValue([
      { post: { id: 'p1' } },
      { post: { id: 'p2' } },
      { post: null },
    ]);
    like.count.mockResolvedValue(3);
    const out = await getUserLikedPosts('u1', { page: 1, limit: 10, skip: 0 });
    expect(out.posts.map((p) => p.id)).toEqual(['p1', 'p2']);
  });
});

describe('deletePost', () => {
  it('scopes delete to authorId', async () => {
    await deletePost('p1', 'u1');
    expect(post.delete).toHaveBeenCalledWith({ where: { id: 'p1', authorId: 'u1' } });
  });
});
