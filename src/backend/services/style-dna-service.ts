import { prisma } from '@/lib/prisma';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { logger } from '@/lib/logger';
import type { TattooStyle } from '@prisma/client';

interface DnaWeights {
  [style: string]: number;
}

interface DnaResult {
  artistId: string;
  weights: DnaWeights;
  sampleSize: number;
  embedding: number[];
}

const STYLE_AXES: TattooStyle[] = [
  'TRADITIONAL',
  'NEO_TRADITIONAL',
  'JAPANESE',
  'BLACKWORK',
  'FINE_LINE',
  'MINIMALIST',
  'REALISM',
  'TRIBAL',
  'BIOMECHANICAL',
  'ABSTRACT',
  'WATERCOLOR',
  'GEOMETRIC',
  'DOTWORK',
  'CHICANO',
  'OTHER',
];

// aggregate style weights from an artist's portfolio.
// each tattoo contributes to its declared styles + likes-weighted importance.
export async function computeArtistStyleDna(artistId: string): Promise<DnaResult> {
  const tattoos = await prisma.tattoo.findMany({
    where: { artistId },
    select: { styles: true, likesCount: true },
  });

  const totals: Record<string, number> = {};
  let totalWeight = 0;

  for (const t of tattoos) {
    const importance = 1 + Math.log10(1 + (t.likesCount ?? 0));
    for (const style of t.styles) {
      totals[style] = (totals[style] ?? 0) + importance;
      totalWeight += importance;
    }
  }

  const weights: DnaWeights = {};
  if (totalWeight > 0) {
    for (const [style, sum] of Object.entries(totals)) {
      weights[style] = round3(sum / totalWeight);
    }
  }

  // 15-dim embedding vector aligned to STYLE_AXES — placeholder for clip image embeddings
  const embedding = STYLE_AXES.map((style) => weights[style] ?? 0);

  return {
    artistId,
    weights,
    sampleSize: tattoos.length,
    embedding,
  };
}

export async function persistStyleDna(result: DnaResult) {
  await prisma.artistStyleDna.upsert({
    where: { artistId: result.artistId },
    create: {
      artistId: result.artistId,
      weights: result.weights,
      embedding: result.embedding,
      sampleSize: result.sampleSize,
    },
    update: {
      weights: result.weights,
      embedding: result.embedding,
      sampleSize: result.sampleSize,
      computedAt: new Date(),
    },
  });
}

export async function getStyleDna(artistId: string) {
  return prisma.artistStyleDna.findUnique({ where: { artistId } });
}

// recompute every artist's style DNA — called from /api/cron/style-dna weekly
export async function recomputeAllStyleDna(): Promise<{ processed: number }> {
  if (!isFeatureEnabled('STYLE_DNA_ENABLED')) {
    logger.info('style-dna recompute skipped — flag off');
    return { processed: 0 };
  }
  const artists = await prisma.artist.findMany({ select: { id: true } });
  let processed = 0;
  for (const a of artists) {
    try {
      const result = await computeArtistStyleDna(a.id);
      if (result.sampleSize > 0) {
        await persistStyleDna(result);
        processed += 1;
      }
    } catch (err) {
      logger.warn({ err, artistId: a.id }, 'style-dna compute failed');
    }
  }
  return { processed };
}

// rank artists by cosine similarity to a target dna vector
export async function findSimilarArtists(artistId: string, limit = 8) {
  const target = await getStyleDna(artistId);
  if (!target || target.embedding.length === 0) return [];
  const all = await prisma.artistStyleDna.findMany({
    where: { artistId: { not: artistId } },
    include: {
      artist: {
        select: { id: true, slug: true, displayName: true, user: { select: { image: true } } },
      },
    },
  });
  type Row = (typeof all)[number];
  const scored = all
    .map((row: Row) => ({
      artist: row.artist,
      score: cosineSimilarity(target.embedding, row.embedding),
    }))
    .filter((row: { score: number }) => row.score > 0)
    .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
    .slice(0, limit);
  return scored;
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / Math.sqrt(na * nb);
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

export const STYLE_DNA_AXES = STYLE_AXES;
