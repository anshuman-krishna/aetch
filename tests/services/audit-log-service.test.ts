const adminAuditLog = {
  create: jest.fn().mockResolvedValue({ id: 'a1' }),
  findMany: jest.fn().mockResolvedValue([]),
  count: jest.fn().mockResolvedValue(0),
};

jest.mock('@/lib/prisma', () => ({ prisma: { adminAuditLog } }));

import {
  clientContext,
  listAuditEvents,
  recordAuditEvent,
} from '@/backend/services/audit-log-service';

beforeEach(() => jest.clearAllMocks());

describe('clientContext', () => {
  it('extracts first ip from x-forwarded-for', () => {
    const req = new Request('http://x', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8', 'user-agent': 'jest' },
    });
    expect(clientContext(req)).toEqual({ ipAddress: '1.2.3.4', userAgent: 'jest' });
  });

  it('falls back to x-real-ip when forwarded missing', () => {
    const req = new Request('http://x', {
      headers: { 'x-real-ip': '9.9.9.9' },
    });
    expect(clientContext(req).ipAddress).toBe('9.9.9.9');
  });

  it('returns undefined when no headers', () => {
    const req = new Request('http://x');
    expect(clientContext(req)).toEqual({ ipAddress: undefined, userAgent: undefined });
  });
});

describe('recordAuditEvent', () => {
  it('persists all fields', async () => {
    await recordAuditEvent({
      actorId: 'u1',
      action: 'POST_REMOVE',
      targetType: 'post',
      targetId: 'p1',
      ipAddress: '1.1.1.1',
    });
    expect(adminAuditLog.create.mock.calls[0][0].data).toMatchObject({
      actorId: 'u1',
      action: 'POST_REMOVE',
      targetType: 'post',
      targetId: 'p1',
      ipAddress: '1.1.1.1',
    });
  });
});

describe('listAuditEvents', () => {
  it('orders by createdAt desc', async () => {
    await listAuditEvents({}, { page: 1, limit: 50, skip: 0 });
    expect(adminAuditLog.findMany.mock.calls[0][0].orderBy).toEqual({ createdAt: 'desc' });
  });

  it('filters by actorId / action / targetId when provided', async () => {
    await listAuditEvents(
      { actorId: 'u1', action: 'TATTOO_REMOVE', targetId: 't1' },
      { page: 1, limit: 50, skip: 0 },
    );
    expect(adminAuditLog.findMany.mock.calls[0][0].where).toEqual({
      actorId: 'u1',
      action: 'TATTOO_REMOVE',
      targetId: 't1',
    });
  });
});
