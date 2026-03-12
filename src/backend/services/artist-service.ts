import { prisma } from '@/lib/prisma';

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
