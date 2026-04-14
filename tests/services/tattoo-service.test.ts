const tattoo = {
  create: jest.fn(),
  findUnique: jest.fn(),
  findMany: jest.fn(),
  count: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};
const like = { findUnique: jest.fn(), create: jest.fn(), delete: jest.fn() };
const savedTattoo = {
  findUnique: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
  findMany: jest.fn(),
  count: jest.fn(),
};
const $transaction = jest.fn().mockImplementation(async (ops) => Promise.all(ops));

jest.mock('@/lib/prisma', () => ({
  prisma: { tattoo, like, savedTattoo, $transaction },
}));

import {
  getTattoos,
  getTrendingTattoos,
  isLikedByUser,
  isSavedByUser,
  isTattooSlugTaken,
  saveTattoo,
  toggleLike,
} from '@/backend/services/tattoo-service';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getTattoos sorting', () => {
  it('uses createdAt desc for latest', async () => {
    tattoo.findMany.mockResolvedValue([]);
    tattoo.count.mockResolvedValue(0);
    await getTattoos({}, { page: 1, limit: 10, skip: 0 }, 'latest');
    expect(tattoo.findMany.mock.calls[0][0].orderBy).toEqual({ createdAt: 'desc' });
  });

  it('uses likesCount desc for popular', async () => {
    tattoo.findMany.mockResolvedValue([]);
    tattoo.count.mockResolvedValue(0);
    await getTattoos({}, { page: 1, limit: 10, skip: 0 }, 'popular');
    expect(tattoo.findMany.mock.calls[0][0].orderBy).toEqual({ likesCount: 'desc' });
  });

  it('builds search OR clause', async () => {
    tattoo.findMany.mockResolvedValue([]);
    tattoo.count.mockResolvedValue(0);
    await getTattoos({ search: 'dragon' }, { page: 1, limit: 10, skip: 0 });
    const where = tattoo.findMany.mock.calls[0][0].where;
    expect(where.OR).toHaveLength(2);
    expect(where.OR[0].title.contains).toBe('dragon');
  });

  it('applies style hasSome filter', async () => {
    tattoo.findMany.mockResolvedValue([]);
    tattoo.count.mockResolvedValue(0);
    await getTattoos(
      { styles: ['JAPANESE' as never, 'TRADITIONAL' as never] },
      { page: 1, limit: 10, skip: 0 },
    );
    const where = tattoo.findMany.mock.calls[0][0].where;
    expect(where.styles).toEqual({ hasSome: ['JAPANESE', 'TRADITIONAL'] });
  });
});

describe('getTrendingTattoos scoring', () => {
  it('ranks by likes*3 + saves*2 + views desc', async () => {
    tattoo.findMany.mockResolvedValue([
      { id: 'a', likesCount: 10, viewsCount: 100, _count: { savedBy: 1 } },
      { id: 'b', likesCount: 5, viewsCount: 200, _count: { savedBy: 50 } },
      { id: 'c', likesCount: 0, viewsCount: 10, _count: { savedBy: 0 } },
    ]);
    const out = await getTrendingTattoos(3);
    // a: 30+2+100=132, b: 15+100+200=315, c: 0+0+10=10
    expect(out.map((t) => t.id)).toEqual(['b', 'a', 'c']);
  });
});

describe('toggleLike', () => {
  it('removes an existing like and decrements', async () => {
    like.findUnique.mockResolvedValue({ id: 'L1' });
    const res = await toggleLike('u1', 't1');
    expect(res).toEqual({ liked: false });
    expect($transaction).toHaveBeenCalledTimes(1);
    expect(like.delete).toHaveBeenCalledWith({ where: { id: 'L1' } });
  });

  it('creates a new like and increments', async () => {
    like.findUnique.mockResolvedValue(null);
    const res = await toggleLike('u1', 't1');
    expect(res).toEqual({ liked: true });
    expect(like.create).toHaveBeenCalledWith({ data: { userId: 'u1', tattooId: 't1' } });
  });
});

describe('saveTattoo', () => {
  it('toggles off when already saved', async () => {
    savedTattoo.findUnique.mockResolvedValue({ id: 'S1' });
    savedTattoo.delete.mockResolvedValue({});
    expect(await saveTattoo('u', 't')).toEqual({ saved: false });
  });

  it('saves when not present', async () => {
    savedTattoo.findUnique.mockResolvedValue(null);
    savedTattoo.create.mockResolvedValue({});
    expect(await saveTattoo('u', 't')).toEqual({ saved: true });
  });
});

describe('existence helpers', () => {
  it('isLikedByUser returns boolean', async () => {
    like.findUnique.mockResolvedValue({ id: 'x' });
    expect(await isLikedByUser('u', 't')).toBe(true);
    like.findUnique.mockResolvedValue(null);
    expect(await isLikedByUser('u', 't')).toBe(false);
  });

  it('isSavedByUser returns boolean', async () => {
    savedTattoo.findUnique.mockResolvedValue(null);
    expect(await isSavedByUser('u', 't')).toBe(false);
  });

  it('isTattooSlugTaken returns boolean', async () => {
    tattoo.findUnique.mockResolvedValue({ id: 'x' });
    expect(await isTattooSlugTaken('taken')).toBe(true);
  });
});
