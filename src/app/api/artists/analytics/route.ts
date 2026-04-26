export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { requireRole } from '@/backend/middleware/role-guard';
import { prisma } from '@/lib/prisma';

// return analytics for authenticated artist
export async function GET() {
  const { session, error } = await requireRole('ARTIST');
  if (error) return error;

  const artist = await prisma.artist.findUnique({
    where: { userId: session!.user.id },
  });

  if (!artist) {
    return NextResponse.json(
      { success: false, error: 'Artist profile not found' },
      { status: 404 },
    );
  }

  // fetch all metrics in parallel
  const [tattoos, bookings, reviewAgg, followersCount] = await Promise.all([
    prisma.tattoo.aggregate({
      where: { artistId: artist.id },
      _count: { id: true },
      _sum: { viewsCount: true, likesCount: true },
    }),
    prisma.booking.groupBy({
      by: ['status'],
      where: { artistId: artist.id },
      _count: { id: true },
    }),
    prisma.review.aggregate({
      where: { artistId: artist.id },
      _avg: { rating: true },
      _count: { id: true },
    }),
    prisma.follower.count({
      where: { followingId: session!.user.id },
    }),
  ]);

  // map booking counts by status
  const bookingMap = Object.fromEntries(bookings.map((b) => [b.status.toLowerCase(), b._count.id]));

  return NextResponse.json({
    success: true,
    analytics: {
      tattoos: tattoos._count.id,
      totalViews: tattoos._sum.viewsCount ?? 0,
      totalLikes: tattoos._sum.likesCount ?? 0,
      bookings: {
        pending: bookingMap.pending ?? 0,
        confirmed: bookingMap.confirmed ?? 0,
        completed: bookingMap.completed ?? 0,
        cancelled: bookingMap.cancelled ?? 0,
      },
      reviews: {
        count: reviewAgg._count.id,
        averageRating: reviewAgg._avg.rating ?? 0,
      },
      followers: followersCount,
    },
  });
}
