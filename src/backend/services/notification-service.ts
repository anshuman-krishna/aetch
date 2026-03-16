import { prisma } from '@/lib/prisma';
import type { NotificationType } from '@prisma/client';

export async function createNotification(data: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  bookingId?: string;
  link?: string;
}) {
  return prisma.notification.create({ data });
}

export async function getUserNotifications(userId: string, limit = 20) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { userId, read: false },
  });
}

export async function markAsRead(notificationId: string, userId: string) {
  return prisma.notification.update({
    where: { id: notificationId, userId },
    data: { read: true },
  });
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}

// notify artist of booking
export async function notifyBookingRequest(bookingId: string, artistUserId: string, clientName: string) {
  return createNotification({
    userId: artistUserId,
    type: 'BOOKING_REQUEST',
    title: 'New booking request',
    message: `${clientName} requested a booking`,
    bookingId,
    link: '/app/dashboard/bookings',
  });
}

// notify new follower
export async function notifyNewFollower(userId: string, followerName: string) {
  return createNotification({
    userId,
    type: 'NEW_FOLLOWER',
    title: 'New follower',
    message: `${followerName} started following you`,
    link: '/app/profile',
  });
}

// notify post like
export async function notifyPostLike(userId: string, postId: string, likerName: string) {
  return createNotification({
    userId,
    type: 'POST_LIKE',
    title: 'New like',
    message: `${likerName} liked your post`,
    link: `/app/post/${postId}`,
  });
}

// notify post comment
export async function notifyPostComment(userId: string, postId: string, commenterName: string) {
  return createNotification({
    userId,
    type: 'POST_COMMENT',
    title: 'New comment',
    message: `${commenterName} commented on your post`,
    link: `/app/post/${postId}`,
  });
}

// notify new message
export async function notifyNewMessage(
  recipientId: string,
  senderName: string,
  conversationId: string,
) {
  return createNotification({
    userId: recipientId,
    type: 'NEW_MESSAGE',
    title: 'New message',
    message: `${senderName} sent you a message`,
    link: `/app/messages/${conversationId}`,
  });
}

// notify booking status
export async function notifyBookingStatusChange(
  bookingId: string,
  clientUserId: string,
  status: string,
  artistName: string,
) {
  const typeMap: Record<string, NotificationType> = {
    CONFIRMED: 'BOOKING_CONFIRMED',
    CANCELLED: 'BOOKING_CANCELLED',
    COMPLETED: 'BOOKING_COMPLETED',
  };

  return createNotification({
    userId: clientUserId,
    type: typeMap[status] ?? 'SYSTEM',
    title: `Booking ${status.toLowerCase()}`,
    message: `${artistName} ${status.toLowerCase()} your booking`,
    bookingId,
    link: '/app/bookings',
  });
}
