import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import type { UpdateArtistInput } from '@/lib/validations';
import { type PaginationParams, buildPaginationMeta } from '@/utils/pagination';

export async function getArtistBySlug(slug: string) {
  return prisma.artist.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          name: true,
          username: true,
          image: true,
        },
      },
      _count: {
        select: {
          tattoos: true,
          reviews: true,
          bookings: true,
        },
      },
    },
  });
}

export async function getArtistByUserId(userId: string) {
  return prisma.artist.findUnique({
    where: { userId },
    include: {
      user: { select: { name: true, username: true, image: true } },
      _count: { select: { tattoos: true, reviews: true, bookings: true } },
    },
  });
}

export async function updateArtist(artistId: string, data: UpdateArtistInput) {
  return prisma.artist.update({
    where: { id: artistId },
    data,
  });
}

export async function getArtistDashboardStats(artistId: string) {
  const [totalTattoos, totalBookings, pendingBookings, totalReviews] = await Promise.all([
    prisma.tattoo.count({ where: { artistId } }),
    prisma.booking.count({ where: { artistId } }),
    prisma.booking.count({ where: { artistId, status: 'PENDING' } }),
    prisma.review.count({ where: { artistId } }),
  ]);

  return { totalTattoos, totalBookings, pendingBookings, totalReviews };
}

export async function getArtistAvailability(artistId: string) {
  return prisma.artistAvailability.findMany({
    where: { artistId },
    orderBy: { dayOfWeek: 'asc' },
  });
}

export async function setArtistAvailability(
  artistId: string,
  slots: { dayOfWeek: number; startTime: string; endTime: string }[],
) {
  // replace all existing slots
  await prisma.artistAvailability.deleteMany({ where: { artistId } });

  if (slots.length === 0) return [];

  return prisma.artistAvailability.createMany({
    data: slots.map((s) => ({ ...s, artistId })),
  });
}

// search artists by name, location, style
interface ArtistSearchFilters {
  q?: string;
  location?: string;
  style?: string;
  shopId?: string;
}

export async function searchArtists(filters: ArtistSearchFilters, pagination: PaginationParams) {
  const where: Prisma.ArtistWhereInput = {};

  if (filters.q) {
    where.OR = [
      { displayName: { contains: filters.q, mode: 'insensitive' } },
      { user: { name: { contains: filters.q, mode: 'insensitive' } } },
      { user: { username: { contains: filters.q, mode: 'insensitive' } } },
    ];
  }
  if (filters.location) {
    where.location = { contains: filters.location, mode: 'insensitive' };
  }
  if (filters.style) {
    where.specialties = { has: filters.style };
  }
  if (filters.shopId) {
    where.shopId = filters.shopId;
  }

  const [artists, total] = await Promise.all([
    prisma.artist.findMany({
      where,
      include: {
        user: { select: { name: true, username: true, image: true } },
        _count: { select: { tattoos: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.artist.count({ where }),
  ]);

  return {
    artists,
    pagination: buildPaginationMeta(total, pagination),
  };
}

// suggested artists based on user activity
export async function getSuggestedArtists(userId: string, limit = 6) {
  // get styles from liked/saved tattoos
  const [likedTattoos, savedTattoos] = await Promise.all([
    prisma.like.findMany({
      where: { userId, tattooId: { not: null } },
      select: { tattoo: { select: { styles: true, artistId: true } } },
      take: 50,
    }),
    prisma.savedTattoo.findMany({
      where: { userId },
      select: { tattoo: { select: { styles: true, artistId: true } } },
      take: 50,
    }),
  ]);

  // collect preferred styles
  const styleCount: Record<string, number> = {};
  const seenArtists = new Set<string>();

  for (const l of likedTattoos) {
    if (l.tattoo) {
      seenArtists.add(l.tattoo.artistId);
      for (const s of l.tattoo.styles) {
        styleCount[s] = (styleCount[s] || 0) + 1;
      }
    }
  }
  for (const s of savedTattoos) {
    if (s.tattoo) {
      seenArtists.add(s.tattoo.artistId);
      for (const st of s.tattoo.styles) {
        styleCount[st] = (styleCount[st] || 0) + 1;
      }
    }
  }

  // get top styles
  const topStyles = Object.entries(styleCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([s]) => s);

  if (topStyles.length === 0) {
    // fallback: return popular artists
    return prisma.artist.findMany({
      include: {
        user: { select: { name: true, username: true, image: true } },
        _count: { select: { tattoos: true } },
      },
      orderBy: { tattoos: { _count: 'desc' } },
      take: limit,
    });
  }

  return prisma.artist.findMany({
    where: {
      specialties: { hasSome: topStyles },
    },
    include: {
      user: { select: { name: true, username: true, image: true } },
      _count: { select: { tattoos: true } },
    },
    orderBy: { tattoos: { _count: 'desc' } },
    take: limit,
  });
}
