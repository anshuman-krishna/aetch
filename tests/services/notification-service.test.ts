const notification = {
  create: jest.fn().mockResolvedValue({ id: 'n1' }),
  findMany: jest.fn().mockResolvedValue([]),
  count: jest.fn().mockResolvedValue(0),
  update: jest.fn().mockResolvedValue({}),
  updateMany: jest.fn().mockResolvedValue({ count: 0 }),
};

jest.mock('@/lib/prisma', () => ({ prisma: { notification } }));

import {
  createNotification,
  getUnreadCount,
  getUserNotifications,
  markAllAsRead,
  markAsRead,
  notifyBookingRequest,
  notifyBookingStatusChange,
  notifyNewFollower,
  notifyNewMessage,
  notifyPostComment,
  notifyPostLike,
} from '@/backend/services/notification-service';

beforeEach(() => jest.clearAllMocks());

describe('basic crud', () => {
  it('create passes data through', async () => {
    await createNotification({
      userId: 'u1',
      type: 'SYSTEM',
      title: 't',
      message: 'm',
    });
    expect(notification.create).toHaveBeenCalledWith({
      data: { userId: 'u1', type: 'SYSTEM', title: 't', message: 'm' },
    });
  });

  it('getUserNotifications uses default limit 20', async () => {
    await getUserNotifications('u1');
    expect(notification.findMany.mock.calls[0][0].take).toBe(20);
  });

  it('getUnreadCount filters read=false', async () => {
    await getUnreadCount('u1');
    expect(notification.count).toHaveBeenCalledWith({ where: { userId: 'u1', read: false } });
  });

  it('markAsRead scopes to user', async () => {
    await markAsRead('n1', 'u1');
    expect(notification.update).toHaveBeenCalledWith({
      where: { id: 'n1', userId: 'u1' },
      data: { read: true },
    });
  });

  it('markAllAsRead scopes to user.read=false', async () => {
    await markAllAsRead('u1');
    expect(notification.updateMany).toHaveBeenCalledWith({
      where: { userId: 'u1', read: false },
      data: { read: true },
    });
  });
});

describe('typed notifiers', () => {
  it('booking request → BOOKING_REQUEST type', async () => {
    await notifyBookingRequest('b1', 'u1', 'Alice');
    expect(notification.create.mock.calls[0][0].data.type).toBe('BOOKING_REQUEST');
  });

  it('new follower → NEW_FOLLOWER type', async () => {
    await notifyNewFollower('u1', 'Bob');
    expect(notification.create.mock.calls[0][0].data.type).toBe('NEW_FOLLOWER');
  });

  it('post like → POST_LIKE type w/ deep link', async () => {
    await notifyPostLike('u1', 'p1', 'Bob');
    const data = notification.create.mock.calls[0][0].data;
    expect(data.type).toBe('POST_LIKE');
    expect(data.link).toBe('/app/post/p1');
  });

  it('post comment → POST_COMMENT type w/ deep link', async () => {
    await notifyPostComment('u1', 'p1', 'Bob');
    expect(notification.create.mock.calls[0][0].data.type).toBe('POST_COMMENT');
  });

  it('new message → NEW_MESSAGE type w/ conversation link', async () => {
    await notifyNewMessage('u1', 'Bob', 'c1');
    const data = notification.create.mock.calls[0][0].data;
    expect(data.type).toBe('NEW_MESSAGE');
    expect(data.link).toBe('/app/messages/c1');
  });

  it.each([
    ['CONFIRMED', 'BOOKING_CONFIRMED'],
    ['CANCELLED', 'BOOKING_CANCELLED'],
    ['COMPLETED', 'BOOKING_COMPLETED'],
  ])('booking status %s → %s type', async (status, expected) => {
    await notifyBookingStatusChange('b1', 'u1', status, 'Alice');
    expect(notification.create.mock.calls[0][0].data.type).toBe(expected);
  });

  it('unknown booking status falls back to SYSTEM', async () => {
    await notifyBookingStatusChange('b1', 'u1', 'NO_SHOW', 'Alice');
    expect(notification.create.mock.calls[0][0].data.type).toBe('SYSTEM');
  });
});
