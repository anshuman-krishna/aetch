jest.mock('@/lib/logger', () => {
  const debug = jest.fn();
  const child = jest.fn().mockReturnValue({ debug, info: jest.fn(), error: jest.fn() });
  return { logger: { debug, child } };
});

import { getRequestId, logRequest, requestLogger, withRequestId } from '@/backend/middleware/request-log';
import { logger } from '@/lib/logger';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getRequestId', () => {
  it('prefers x-request-id header', () => {
    const req = new Request('http://x/y', { headers: { 'x-request-id': 'abc-123' } });
    expect(getRequestId(req)).toBe('abc-123');
  });

  it('falls back to x-correlation-id', () => {
    const req = new Request('http://x/y', { headers: { 'x-correlation-id': 'corr-1' } });
    expect(getRequestId(req)).toBe('corr-1');
  });

  it('generates an id when none present', () => {
    const req = new Request('http://x/y');
    const id = getRequestId(req);
    expect(id).toMatch(/^[a-z0-9-]+$/i);
    expect(id.length).toBeGreaterThan(4);
  });
});

describe('requestLogger', () => {
  it('creates a child logger with request context', () => {
    const req = new Request('http://x/api/ping', { method: 'POST', headers: { 'x-request-id': 'rid' } });
    requestLogger(req, { userId: 'u1' });
    expect((logger as unknown as { child: jest.Mock }).child).toHaveBeenCalledWith(
      expect.objectContaining({ requestId: 'rid', method: 'POST', path: '/api/ping', userId: 'u1' }),
    );
  });
});

describe('logRequest', () => {
  const env = process.env as Record<string, string | undefined>;

  it('no-ops in production', () => {
    const prev = env.NODE_ENV;
    env.NODE_ENV = 'production';
    logRequest(new Request('http://x/api/y'));
    expect((logger as unknown as { debug: jest.Mock }).debug).not.toHaveBeenCalled();
    env.NODE_ENV = prev;
  });

  it('logs in development', () => {
    const prev = env.NODE_ENV;
    env.NODE_ENV = 'development';
    logRequest(new Request('http://x/api/y?q=1'));
    expect((logger as unknown as { debug: jest.Mock }).debug).toHaveBeenCalled();
    env.NODE_ENV = prev;
  });
});

describe('withRequestId', () => {
  it('copies the request id onto response headers', () => {
    const req = new Request('http://x/y', { headers: { 'x-request-id': 'rid-xyz' } });
    const res = new Response('ok');
    const out = withRequestId(req, res);
    expect(out.headers.get('x-request-id')).toBe('rid-xyz');
  });
});
