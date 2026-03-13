import { prisma } from '@/lib/prisma';
import { type PaginationParams, buildPaginationMeta } from '@/utils/pagination';

const bookingInclude = {
  user: { select: { id: true, name: true, username: true, image: true } },
  artist: {
    select: {
      id: true,
      displayName: true,
      slug: true,
      user: { select: { image: true } },
    },
  },
} as const;

export async function createBooking(data: {
  userId: string;
  artistId: string;
  date: Date;
  duration?: number;
  tattooIdea?: string;
  placement?: string;
  size?: string;
  description?: string;
  referenceImages?: string[];
}) {
  return prisma.booking.create({
    data: {
      userId: data.userId,
      artistId: data.artistId,
      date: data.date,
      duration: data.duration,
      tattooIdea: data.tattooIdea,
      placement: data.placement,
      size: data.size,
      description: data.description,
      referenceImages: data.referenceImages ?? [],
    },
    include: bookingInclude,
  });
}

export async function getBookingById(id: string) {
  return prisma.booking.findUnique({
    where: { id },
    include: bookingInclude,
  });
}

export async function getUserBookings(userId: string, pagination: PaginationParams) {
  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where: { userId },
      include: bookingInclude,
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.booking.count({ where: { userId } }),
  ]);

  return { bookings, pagination: buildPaginationMeta(total, pagination) };
}

export async function getArtistBookings(
  artistId: string,
  pagination: PaginationParams,
  status?: string,
) {
  const where = {
    artistId,
    ...(status ? { status: status as never } : {}),
  };

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: bookingInclude,
      orderBy: { date: 'asc' },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.booking.count({ where }),
  ]);

  return { bookings, pagination: buildPaginationMeta(total, pagination) };
}

export async function updateBookingStatus(
  bookingId: string,
  artistId: string,
  data: { status: string; artistNotes?: string; price?: number },
) {
  return prisma.booking.update({
    where: { id: bookingId, artistId },
    data: {
      status: data.status as never,
      artistNotes: data.artistNotes,
      price: data.price,
    },
    include: bookingInclude,
  });
}

export async function getUpcomingBookings(artistId: string, limit = 5) {
  return prisma.booking.findMany({
    where: {
      artistId,
      status: 'CONFIRMED',
      date: { gte: new Date() },
    },
    include: bookingInclude,
    orderBy: { date: 'asc' },
    take: limit,
  });
}
