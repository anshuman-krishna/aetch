import { prisma } from '@/lib/prisma';

export async function getShopBySlug(slug: string) {
  return prisma.shop.findUnique({
    where: { slug },
    include: {
      artists: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
      _count: {
        select: {
          reviews: true,
          bookings: true,
        },
      },
    },
  });
}
