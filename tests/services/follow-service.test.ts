const follower = {
  findUnique: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
  findMany: jest.fn(),
  count: jest.fn(),
};

jest.mock('@/lib/prisma', () => ({ prisma: { follower } }));

import {
  getFollowers,
  getFollowing,
  isFollowing,
  toggleFollow,
} from '@/backend/services/follow-service';

beforeEach(() => jest.clearAllMocks());

describe('toggleFollow', () => {
  it('throws on self-follow', async () => {
    await expect(toggleFollow('u1', 'u1')).rejects.toThrow(/cannot follow yourself/i);
  });

  it('creates record when none exists', async () => {
    follower.findUnique.mockResolvedValue(null);
    follower.create.mockResolvedValue({ id: 'f1' });
    const result = await toggleFollow('u1', 'u2');
    expect(result).toEqual({ following: true });
    expect(follower.create).toHaveBeenCalled();
    expect(follower.delete).not.toHaveBeenCalled();
  });

  it('deletes record when exists', async () => {
    follower.findUnique.mockResolvedValue({ id: 'f1' });
    const result = await toggleFollow('u1', 'u2');
    expect(result).toEqual({ following: false });
    expect(follower.delete).toHaveBeenCalledWith({ where: { id: 'f1' } });
  });
});

describe('isFollowing', () => {
  it('returns true when row exists', async () => {
    follower.findUnique.mockResolvedValue({ id: 'f1' });
    expect(await isFollowing('u1', 'u2')).toBe(true);
  });
  it('returns false when no row', async () => {
    follower.findUnique.mockResolvedValue(null);
    expect(await isFollowing('u1', 'u2')).toBe(false);
  });
});

describe('getFollowers / getFollowing', () => {
  it('flattens follower.follower into users list', async () => {
    follower.findMany.mockResolvedValue([{ follower: { id: 'a' } }, { follower: { id: 'b' } }]);
    follower.count.mockResolvedValue(2);
    const out = await getFollowers('u1', { page: 1, limit: 10, skip: 0 });
    expect(out.users.map((u) => u.id)).toEqual(['a', 'b']);
  });

  it('flattens follower.following into users list', async () => {
    follower.findMany.mockResolvedValue([{ following: { id: 'c' } }, { following: { id: 'd' } }]);
    follower.count.mockResolvedValue(2);
    const out = await getFollowing('u1', { page: 1, limit: 10, skip: 0 });
    expect(out.users.map((u) => u.id)).toEqual(['c', 'd']);
  });
});
