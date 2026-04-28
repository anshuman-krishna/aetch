import { prisma } from '@/lib/prisma';
import { type PaginationParams, buildPaginationMeta } from '@/utils/pagination';
import type { UpdateShopInput } from '@/lib/validations';

// shared shop include
const shopInclude = {
  artists: {
    include: {
      user: { select: { name: true, image: true, username: true } },
    },
  },
  shopArtists: {
    include: {
      artist: {
        include: {
          user: { select: { name: true, image: true, username: true } },
          _count: { select: { tattoos: true, reviews: true } },
        },
      },
    },
  },
  _count: { select: { reviews: true, bookings: true } },
} as const;

// compact list include
const shopListInclude = {
  _count: { select: { reviews: true, bookings: true } },
  shopArtists: { select: { id: true } },
} as const;

export async function getShopBySlug(slug: string) {
  return prisma.shop.findUnique({
    where: { slug },
    include: shopInclude,
  });
}

export async function getShopById(id: string) {
  return prisma.shop.findUnique({
    where: { id },
    include: shopInclude,
  });
}

export async function getShopByOwnerId(ownerId: string) {
  return prisma.shop.findFirst({
    where: { ownerId },
    include: shopInclude,
  });
}

// shops with lat/lng for the global map. caps at 5000 to stay light on the wire.
export async function listShopsForMap() {
  return prisma.shop.findMany({
    where: {
      latitude: { not: null },
      longitude: { not: null },
    },
    select: {
      id: true,
      slug: true,
      name: true,
      city: true,
      country: true,
      latitude: true,
      longitude: true,
      image: true,
      verified: true,
    },
    take: 5000,
  });
}

// list distinct cities — feeds /app/shops/[city] sitemap
export async function listShopCities(limit = 200) {
  const rows = await prisma.shop.findMany({
    where: { city: { not: null } },
    select: { city: true },
    distinct: ['city'],
    take: limit,
  });
  return rows
    .map((r) => r.city as string)
    .filter(Boolean)
    .sort();
}

export async function getShops(
  pagination: PaginationParams,
  filters?: { city?: string; search?: string; sort?: string },
) {
  const where = {
    ...(filters?.city ? { city: { contains: filters.city, mode: 'insensitive' as const } } : {}),
    ...(filters?.search
      ? { name: { contains: filters.search, mode: 'insensitive' as const } }
      : {}),
  };

  const orderBy =
    filters?.sort === 'name' ? { name: 'asc' as const } : { createdAt: 'desc' as const };

  const [shops, total] = await Promise.all([
    prisma.shop.findMany({
      where,
      include: shopListInclude,
      orderBy,
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.shop.count({ where }),
  ]);

  return { shops, pagination: buildPaginationMeta(total, pagination) };
}

export async function updateShop(shopId: string, data: UpdateShopInput) {
  return prisma.shop.update({
    where: { id: shopId },
    data,
  });
}

// artist management
export async function addArtistToShop(
  shopId: string,
  artistId: string,
  role: 'OWNER' | 'LEAD_ARTIST' | 'ARTIST' | 'GUEST' | 'APPRENTICE' = 'ARTIST',
) {
  return prisma.shopArtist.create({
    data: { shopId, artistId, role },
    include: {
      artist: {
        include: { user: { select: { name: true, image: true } } },
      },
    },
  });
}

export async function removeArtistFromShop(shopId: string, artistId: string) {
  return prisma.shopArtist.delete({
    where: { shopId_artistId: { shopId, artistId } },
  });
}

export async function getShopArtists(shopId: string) {
  return prisma.shopArtist.findMany({
    where: { shopId },
    include: {
      artist: {
        include: {
          user: { select: { name: true, image: true, username: true } },
          _count: { select: { tattoos: true, reviews: true } },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
}

// shop portfolio query
export async function getShopTattoos(shopId: string, pagination: PaginationParams) {
  const shopArtists = await prisma.shopArtist.findMany({
    where: { shopId },
    select: { artistId: true },
  });
  const artistIds = shopArtists.map((sa) => sa.artistId);

  if (artistIds.length === 0) {
    return { tattoos: [], pagination: buildPaginationMeta(0, pagination) };
  }

  const where = { artistId: { in: artistIds } };

  const [tattoos, total] = await Promise.all([
    prisma.tattoo.findMany({
      where,
      include: {
        artist: {
          include: { user: { select: { image: true, username: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.tattoo.count({ where }),
  ]);

  return { tattoos, pagination: buildPaginationMeta(total, pagination) };
}

// shop dashboard stats
export async function getShopDashboardStats(shopId: string) {
  const [artistCount, bookingCount, pendingCount, reviewCount] = await Promise.all([
    prisma.shopArtist.count({ where: { shopId } }),
    prisma.booking.count({ where: { shopId } }),
    prisma.booking.count({ where: { shopId, status: 'PENDING' } }),
    prisma.review.count({ where: { shopId } }),
  ]);

  return { artistCount, bookingCount, pendingCount, reviewCount };
}

// shop bookings
export async function getShopBookings(
  shopId: string,
  pagination: PaginationParams,
  status?: string,
) {
  const where = {
    shopId,
    ...(status ? { status: status as never } : {}),
  };

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, username: true, image: true } },
        artist: {
          select: { id: true, displayName: true, slug: true, user: { select: { image: true } } },
        },
      },
      orderBy: { date: 'asc' },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.booking.count({ where }),
  ]);

  return { bookings, pagination: buildPaginationMeta(total, pagination) };
}
