const bookingMock = {
  create: jest.fn(),
  findUnique: jest.fn(),
  findMany: jest.fn(),
  count: jest.fn(),
  update: jest.fn(),
};

jest.mock('@/lib/prisma', () => ({
  prisma: { booking: bookingMock },
}));

import {
  VALID_TRANSITIONS,
  createBooking,
  getArtistBookings,
  getBookingById,
  getUpcomingBookings,
  getUserBookings,
  hasConflictingBooking,
  updateBookingStatus,
} from '@/backend/services/booking-service';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('VALID_TRANSITIONS', () => {
  it('terminal states have no outgoing transitions', () => {
    expect(VALID_TRANSITIONS.COMPLETED).toEqual([]);
    expect(VALID_TRANSITIONS.CANCELLED).toEqual([]);
    expect(VALID_TRANSITIONS.NO_SHOW).toEqual([]);
  });

  it('PENDING can transition to CONFIRMED or CANCELLED only', () => {
    expect(VALID_TRANSITIONS.PENDING).toEqual(['CONFIRMED', 'CANCELLED']);
  });

  it('CONFIRMED can terminate in COMPLETED / CANCELLED / NO_SHOW', () => {
    expect(new Set(VALID_TRANSITIONS.CONFIRMED)).toEqual(
      new Set(['COMPLETED', 'CANCELLED', 'NO_SHOW']),
    );
  });
});

describe('createBooking', () => {
  it('passes fields and default referenceImages=[]', async () => {
    bookingMock.create.mockResolvedValue({ id: 'b1' });
    await createBooking({
      userId: 'u1',
      artistId: 'a1',
      date: new Date('2030-01-01'),
      tattooIdea: 'dragon',
    });
    expect(bookingMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'u1',
          artistId: 'a1',
          referenceImages: [],
          tattooIdea: 'dragon',
        }),
      }),
    );
  });

  it('forwards provided referenceImages', async () => {
    bookingMock.create.mockResolvedValue({ id: 'b2' });
    await createBooking({
      userId: 'u1',
      artistId: 'a1',
      date: new Date(),
      referenceImages: ['https://cdn/a.jpg'],
    });
    const arg = bookingMock.create.mock.calls[0][0];
    expect(arg.data.referenceImages).toEqual(['https://cdn/a.jpg']);
  });
});

describe('getBookingById', () => {
  it('queries by id with includes', async () => {
    bookingMock.findUnique.mockResolvedValue(null);
    const result = await getBookingById('b1');
    expect(bookingMock.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'b1' } }),
    );
    expect(result).toBeNull();
  });
});

describe('getUserBookings', () => {
  it('returns bookings + pagination meta', async () => {
    bookingMock.findMany.mockResolvedValue([{ id: 'b1' }, { id: 'b2' }]);
    bookingMock.count.mockResolvedValue(2);
    const out = await getUserBookings('u1', { page: 1, limit: 10, skip: 0 });
    expect(out.bookings).toHaveLength(2);
    expect(out.pagination).toMatchObject({ total: 2, totalPages: 1, page: 1 });
  });
});

describe('getArtistBookings', () => {
  it('filters by status when given', async () => {
    bookingMock.findMany.mockResolvedValue([]);
    bookingMock.count.mockResolvedValue(0);
    await getArtistBookings('a1', { page: 1, limit: 20, skip: 0 }, 'PENDING');
    const findArg = bookingMock.findMany.mock.calls[0][0];
    expect(findArg.where).toMatchObject({ artistId: 'a1', status: 'PENDING' });
  });

  it('omits status filter when not provided', async () => {
    bookingMock.findMany.mockResolvedValue([]);
    bookingMock.count.mockResolvedValue(0);
    await getArtistBookings('a1', { page: 1, limit: 20, skip: 0 });
    const findArg = bookingMock.findMany.mock.calls[0][0];
    expect(findArg.where).toEqual({ artistId: 'a1' });
  });
});

describe('updateBookingStatus', () => {
  it('updates by composite where (id + artistId)', async () => {
    bookingMock.update.mockResolvedValue({ id: 'b1', status: 'CONFIRMED' });
    await updateBookingStatus('b1', 'a1', { status: 'CONFIRMED', price: 150 });
    expect(bookingMock.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'b1', artistId: 'a1' },
        data: expect.objectContaining({ status: 'CONFIRMED', price: 150 }),
      }),
    );
  });
});

describe('hasConflictingBooking', () => {
  it('returns true when overlap count > 0', async () => {
    bookingMock.count.mockResolvedValue(1);
    await expect(hasConflictingBooking('a1', new Date('2030-01-01T10:00Z'))).resolves.toBe(true);
  });

  it('queries a 2-hour window around the target date', async () => {
    bookingMock.count.mockResolvedValue(0);
    const target = new Date('2030-01-01T10:00:00Z');
    await hasConflictingBooking('a1', target);
    const where = bookingMock.count.mock.calls[0][0].where;
    expect(where.artistId).toBe('a1');
    expect(where.date.gte.getTime()).toBe(target.getTime() - 2 * 60 * 60 * 1000);
    expect(where.date.lte.getTime()).toBe(target.getTime() + 2 * 60 * 60 * 1000);
    expect(where.status.in).toEqual(['PENDING', 'CONFIRMED']);
  });
});

describe('getUpcomingBookings', () => {
  it('filters CONFIRMED + future + limits results', async () => {
    bookingMock.findMany.mockResolvedValue([]);
    await getUpcomingBookings('a1', 3);
    const arg = bookingMock.findMany.mock.calls[0][0];
    expect(arg.take).toBe(3);
    expect(arg.where.status).toBe('CONFIRMED');
    expect(arg.where.date.gte).toBeInstanceOf(Date);
  });
});
