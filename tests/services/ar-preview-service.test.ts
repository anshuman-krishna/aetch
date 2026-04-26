const tattooPreview = {
  create: jest.fn(),
  findMany: jest.fn(),
  count: jest.fn(),
  findUnique: jest.fn(),
  delete: jest.fn(),
};

jest.mock('@/lib/prisma', () => ({ prisma: { tattooPreview } }));

const ffMock = jest.fn();
jest.mock('@/lib/feature-flags', () => ({
  isFeatureEnabled: (...args: unknown[]) => ffMock(...args),
}));

import {
  deletePreview,
  getPreviewById,
  getUserPreviews,
  savePreview,
} from '@/backend/services/ar-preview-service';

beforeEach(() => {
  jest.clearAllMocks();
  ffMock.mockReturnValue(true);
});

const baseInput = {
  userId: 'u1',
  bodyImageUrl: 'b',
  tattooImageUrl: 't',
  positionX: 50,
  positionY: 50,
  scale: 1,
  rotation: 0,
  opacity: 0.85,
};

describe('savePreview', () => {
  it('throws when feature flag off', async () => {
    ffMock.mockReturnValue(false);
    await expect(savePreview(baseInput)).rejects.toThrow(/disabled/i);
  });

  it('persists all fields when enabled', async () => {
    tattooPreview.create.mockResolvedValue({ id: 'p1' });
    await savePreview(baseInput);
    expect(tattooPreview.create.mock.calls[0][0].data).toMatchObject({
      userId: 'u1',
      positionX: 50,
      opacity: 0.85,
    });
  });
});

describe('getUserPreviews', () => {
  it('paginates and filters by userId', async () => {
    tattooPreview.findMany.mockResolvedValue([]);
    tattooPreview.count.mockResolvedValue(0);
    await getUserPreviews('u1', { page: 1, limit: 5, skip: 0 });
    expect(tattooPreview.findMany.mock.calls[0][0]).toMatchObject({
      where: { userId: 'u1' },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
  });
});

describe('getPreviewById', () => {
  it('passes id to findUnique', async () => {
    await getPreviewById('p1');
    expect(tattooPreview.findUnique).toHaveBeenCalledWith({ where: { id: 'p1' } });
  });
});

describe('deletePreview', () => {
  it('throws when not found', async () => {
    tattooPreview.findUnique.mockResolvedValue(null);
    await expect(deletePreview('p1', 'u1')).rejects.toThrow(/not found/i);
  });

  it('throws when wrong owner', async () => {
    tattooPreview.findUnique.mockResolvedValue({ id: 'p1', userId: 'someone-else' });
    await expect(deletePreview('p1', 'u1')).rejects.toThrow(/not found/i);
  });

  it('deletes when owner matches', async () => {
    tattooPreview.findUnique.mockResolvedValue({ id: 'p1', userId: 'u1' });
    await deletePreview('p1', 'u1');
    expect(tattooPreview.delete).toHaveBeenCalledWith({ where: { id: 'p1' } });
  });
});
