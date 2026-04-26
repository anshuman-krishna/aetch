const collection = {
  create: jest.fn(),
  findMany: jest.fn(),
  findUnique: jest.fn(),
  count: jest.fn(),
};
const collectionItem = {
  create: jest.fn(),
  findUnique: jest.fn(),
  delete: jest.fn(),
};

jest.mock('@/lib/prisma', () => ({ prisma: { collection, collectionItem } }));

import {
  addCollectionItem,
  createCollection,
  getCollectionBySlug,
  getCollectionsForOwner,
  removeCollectionItem,
} from '@/backend/services/collection-service';

beforeEach(() => jest.clearAllMocks());

describe('createCollection', () => {
  it('defaults isPublic=true', async () => {
    collection.create.mockResolvedValue({ id: 'c1' });
    await createCollection({ ownerId: 'u1', name: 'Sleeves', slug: 'sleeves' });
    expect(collection.create.mock.calls[0][0].data.isPublic).toBe(true);
  });

  it('respects isPublic=false override', async () => {
    collection.create.mockResolvedValue({ id: 'c2' });
    await createCollection({
      ownerId: 'u1',
      name: 'Private',
      slug: 'private',
      isPublic: false,
    });
    expect(collection.create.mock.calls[0][0].data.isPublic).toBe(false);
  });
});

describe('getCollectionsForOwner', () => {
  it('paginates + filters by owner', async () => {
    collection.findMany.mockResolvedValue([]);
    collection.count.mockResolvedValue(0);
    await getCollectionsForOwner('u1', { page: 1, limit: 10, skip: 0 });
    expect(collection.findMany.mock.calls[0][0]).toMatchObject({
      where: { ownerId: 'u1' },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  });
});

describe('getCollectionBySlug', () => {
  it('uses compound (ownerId, slug) unique index', async () => {
    await getCollectionBySlug('u1', 'flash');
    expect(collection.findUnique.mock.calls[0][0].where).toEqual({
      ownerId_slug: { ownerId: 'u1', slug: 'flash' },
    });
  });
});

describe('addCollectionItem', () => {
  it('throws when collection not found', async () => {
    collection.findUnique.mockResolvedValue(null);
    await expect(
      addCollectionItem({ collectionId: 'c1', ownerId: 'u1', tattooId: 't1' }),
    ).rejects.toThrow(/not found/i);
  });

  it('throws when caller is not owner', async () => {
    collection.findUnique.mockResolvedValue({ ownerId: 'someone-else' });
    await expect(
      addCollectionItem({ collectionId: 'c1', ownerId: 'u1', tattooId: 't1' }),
    ).rejects.toThrow(/not found/i);
  });

  it('persists item when owner matches', async () => {
    collection.findUnique.mockResolvedValue({ ownerId: 'u1' });
    collectionItem.create.mockResolvedValue({ id: 'i1' });
    await addCollectionItem({ collectionId: 'c1', ownerId: 'u1', postId: 'p1', note: 'cool' });
    expect(collectionItem.create.mock.calls[0][0].data).toMatchObject({
      collectionId: 'c1',
      postId: 'p1',
      note: 'cool',
    });
  });
});

describe('removeCollectionItem', () => {
  it('throws when item missing', async () => {
    collectionItem.findUnique.mockResolvedValue(null);
    await expect(removeCollectionItem('i1', 'u1')).rejects.toThrow(/not found/i);
  });

  it('throws when caller is not owner of parent collection', async () => {
    collectionItem.findUnique.mockResolvedValue({
      collection: { ownerId: 'someone-else' },
    });
    await expect(removeCollectionItem('i1', 'u1')).rejects.toThrow(/not found/i);
  });

  it('deletes when owner matches', async () => {
    collectionItem.findUnique.mockResolvedValue({ collection: { ownerId: 'u1' } });
    await removeCollectionItem('i1', 'u1');
    expect(collectionItem.delete).toHaveBeenCalledWith({ where: { id: 'i1' } });
  });
});
