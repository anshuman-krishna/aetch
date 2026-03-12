import { prisma } from '@/lib/prisma';
import type { TattooStyle, ColorType, Prisma } from '@prisma/client';
import { type PaginationParams, buildPaginationMeta } from '@/utils/pagination';

interface CreateTattooData {
  title: string;
  slug: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  blurDataUrl?: string;
  styles: TattooStyle[];
  bodyPlacement?: string;
  colorType: ColorType;
  width?: number;
  height?: number;
  artistId: string;
}

interface TattooFilters {
  styles?: TattooStyle[];
  bodyPlacement?: string;
  colorType?: ColorType;
  artistId?: string;
  search?: string;
}

const tattooInclude = {
  artist: {
    select: {
      id: true,
      displayName: true,
      slug: true,
      verified: true,
      user: {
        select: {
          image: true,
          username: true,
        },
      },
    },
  },
} satisfies Prisma.TattooInclude;

export async function createTattoo(data: CreateTattooData) {
  return prisma.tattoo.create({
    data,
    include: tattooInclude,
  });
}

export async function getTattooBySlug(slug: string) {
  return prisma.tattoo.findUnique({
    where: { slug },
    include: tattooInclude,
  });
}

export async function getTattoos(
  filters: TattooFilters,
  pagination: PaginationParams,
  sort: 'latest' | 'popular' | 'trending' = 'latest',
) {
  const where: Prisma.TattooWhereInput = {};

  if (filters.artistId) {
    where.artistId = filters.artistId;
  }
  if (filters.styles?.length) {
    where.styles = { hasSome: filters.styles };
  }
  if (filters.bodyPlacement) {
    where.bodyPlacement = filters.bodyPlacement;
  }
  if (filters.colorType) {
    where.colorType = filters.colorType;
  }
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  let orderBy: Prisma.TattooOrderByWithRelationInput;
  switch (sort) {
    case 'popular':
      orderBy = { likesCount: 'desc' };
      break;
    case 'trending':
      orderBy = { viewsCount: 'desc' };
      break;
    default:
      orderBy = { createdAt: 'desc' };
  }

  const [tattoos, total] = await Promise.all([
    prisma.tattoo.findMany({
      where,
      include: tattooInclude,
      orderBy,
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.tattoo.count({ where }),
  ]);

  return {
    tattoos,
    pagination: buildPaginationMeta(total, pagination),
  };
}

export async function getTrendingTattoos(limit = 20) {
  // Trending = weighted score: likes * 3 + views * 1, biased toward recency
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return prisma.tattoo.findMany({
    where: {
      createdAt: { gte: sevenDaysAgo },
    },
    include: tattooInclude,
    orderBy: [
      { likesCount: 'desc' },
      { viewsCount: 'desc' },
      { createdAt: 'desc' },
    ],
    take: limit,
  });
}

export async function getArtistTattoos(artistId: string, pagination: PaginationParams) {
  const [tattoos, total] = await Promise.all([
    prisma.tattoo.findMany({
      where: { artistId },
      include: tattooInclude,
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.tattoo.count({ where: { artistId } }),
  ]);

  return {
    tattoos,
    pagination: buildPaginationMeta(total, pagination),
  };
}

export async function incrementViewCount(tattooId: string) {
  return prisma.tattoo.update({
    where: { id: tattooId },
    data: { viewsCount: { increment: 1 } },
  });
}

export async function toggleLike(userId: string, tattooId: string) {
  const existing = await prisma.like.findUnique({
    where: { userId_tattooId: { userId, tattooId } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.like.delete({ where: { id: existing.id } }),
      prisma.tattoo.update({
        where: { id: tattooId },
        data: { likesCount: { decrement: 1 } },
      }),
    ]);
    return { liked: false };
  }

  await prisma.$transaction([
    prisma.like.create({ data: { userId, tattooId } }),
    prisma.tattoo.update({
      where: { id: tattooId },
      data: { likesCount: { increment: 1 } },
    }),
  ]);
  return { liked: true };
}

export async function isLikedByUser(userId: string, tattooId: string) {
  const like = await prisma.like.findUnique({
    where: { userId_tattooId: { userId, tattooId } },
    select: { id: true },
  });
  return !!like;
}

export async function saveTattoo(userId: string, tattooId: string) {
  const existing = await prisma.savedTattoo.findUnique({
    where: { userId_tattooId: { userId, tattooId } },
  });

  if (existing) {
    await prisma.savedTattoo.delete({ where: { id: existing.id } });
    return { saved: false };
  }

  await prisma.savedTattoo.create({ data: { userId, tattooId } });
  return { saved: true };
}

export async function getSavedTattoos(userId: string, pagination: PaginationParams) {
  const [saved, total] = await Promise.all([
    prisma.savedTattoo.findMany({
      where: { userId },
      include: {
        tattoo: {
          include: tattooInclude,
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.savedTattoo.count({ where: { userId } }),
  ]);

  return {
    tattoos: saved.map((s) => s.tattoo),
    pagination: buildPaginationMeta(total, pagination),
  };
}

export async function isSavedByUser(userId: string, tattooId: string) {
  const saved = await prisma.savedTattoo.findUnique({
    where: { userId_tattooId: { userId, tattooId } },
    select: { id: true },
  });
  return !!saved;
}

export async function isTattooSlugTaken(slug: string) {
  const tattoo = await prisma.tattoo.findUnique({
    where: { slug },
    select: { id: true },
  });
  return !!tattoo;
}

export async function getRelatedTattoos(tattooId: string, styles: TattooStyle[], limit = 6) {
  return prisma.tattoo.findMany({
    where: {
      id: { not: tattooId },
      styles: { hasSome: styles },
    },
    include: tattooInclude,
    orderBy: { likesCount: 'desc' },
    take: limit,
  });
}

export async function deleteTattoo(tattooId: string) {
  return prisma.tattoo.delete({ where: { id: tattooId } });
}
