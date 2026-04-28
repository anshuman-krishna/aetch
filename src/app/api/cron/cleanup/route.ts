export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-error';
import { withRequestId } from '@/backend/middleware/request-log';
import { assertCronAuth } from '@/lib/cron';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

const NOTIFICATION_TTL_DAYS = 60;
const PENDING_BOOKING_TTL_DAYS = 14;
const AI_GENERATION_TTL_DAYS = 30;

// vercel cron + manual trigger; runs at 03:00 utc daily
export const GET = withErrorHandler(async (req: Request) => {
  const unauth = assertCronAuth(req);
  if (unauth) return withRequestId(req, unauth);

  const now = Date.now();
  const notifCutoff = new Date(now - NOTIFICATION_TTL_DAYS * 24 * 60 * 60 * 1000);
  const bookingCutoff = new Date(now - PENDING_BOOKING_TTL_DAYS * 24 * 60 * 60 * 1000);
  const aiCutoff = new Date(now - AI_GENERATION_TTL_DAYS * 24 * 60 * 60 * 1000);

  const [staleNotifications, expiredBookings, staleAi] = await Promise.all([
    prisma.notification.deleteMany({
      where: { read: true, createdAt: { lt: notifCutoff } },
    }),
    prisma.booking.updateMany({
      where: {
        status: 'PENDING',
        date: { lt: bookingCutoff },
      },
      data: { status: 'CANCELLED' },
    }),
    prisma.aIGeneration.deleteMany({
      where: { status: 'FAILED', createdAt: { lt: aiCutoff } },
    }),
  ]);

  logger.info(
    {
      staleNotifications: staleNotifications.count,
      expiredBookings: expiredBookings.count,
      staleAi: staleAi.count,
    },
    'cron cleanup completed',
  );

  return withRequestId(
    req,
    NextResponse.json({
      success: true,
      cleaned: {
        notifications: staleNotifications.count,
        bookings: expiredBookings.count,
        aiGenerations: staleAi.count,
      },
    }),
  );
}, 'GET /api/cron/cleanup');
