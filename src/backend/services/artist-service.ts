import { prisma } from '@/lib/prisma';
import type { UpdateArtistInput } from '@/lib/validations';

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
