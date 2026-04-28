import { computeArtistStyleDna, persistStyleDna } from '@/backend/services/style-dna-service';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    tattoo: { findMany: jest.fn() },
    artistStyleDna: { upsert: jest.fn() },
  },
}));

const tattooFindMany = prisma.tattoo.findMany as jest.Mock;
const dnaUpsert = prisma.artistStyleDna.upsert as jest.Mock;

describe('style-dna-service.computeArtistStyleDna', () => {
  beforeEach(() => {
    tattooFindMany.mockReset();
    dnaUpsert.mockReset();
  });

  it('returns empty weights when there are no tattoos', async () => {
    tattooFindMany.mockResolvedValueOnce([]);
    const result = await computeArtistStyleDna('artist-1');
    expect(result.sampleSize).toBe(0);
    expect(Object.keys(result.weights)).toHaveLength(0);
  });

  it('weights are normalized to ~1', async () => {
    tattooFindMany.mockResolvedValueOnce([
      { styles: ['JAPANESE'], likesCount: 10 },
      { styles: ['JAPANESE'], likesCount: 5 },
      { styles: ['TRADITIONAL'], likesCount: 0 },
    ]);
    const result = await computeArtistStyleDna('artist-2');
    const total = Object.values(result.weights).reduce((s, n) => s + n, 0);
    expect(total).toBeGreaterThan(0.99);
    expect(total).toBeLessThan(1.01);
    expect(result.weights.JAPANESE).toBeGreaterThan(result.weights.TRADITIONAL);
  });

  it('embedding is aligned to STYLE_AXES with same length', async () => {
    tattooFindMany.mockResolvedValueOnce([{ styles: ['BLACKWORK'], likesCount: 0 }]);
    const result = await computeArtistStyleDna('artist-3');
    expect(result.embedding.length).toBe(15);
    const nonZero = result.embedding.filter((n) => n > 0).length;
    expect(nonZero).toBe(1);
  });

  it('persistStyleDna upserts on the unique artistId', async () => {
    dnaUpsert.mockResolvedValueOnce({});
    await persistStyleDna({
      artistId: 'artist-4',
      weights: { TRADITIONAL: 1 },
      embedding: [1, 0, 0],
      sampleSize: 1,
    });
    expect(dnaUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { artistId: 'artist-4' } }),
    );
  });
});
