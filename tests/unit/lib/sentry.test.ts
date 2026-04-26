// the sentry shim should be a no-op (loggable) when SENTRY_DSN is unset

beforeEach(() => {
  jest.resetModules();
  delete process.env.SENTRY_DSN;
});

describe('sentry shim (no DSN)', () => {
  it('captureException routes to logger.error without throwing', async () => {
    const errorSpy = jest.fn();
    jest.doMock('@/lib/logger', () => ({
      logger: { error: errorSpy, warn: jest.fn(), info: jest.fn() },
    }));
    const mod = await import('@/lib/sentry');
    mod.captureException(new Error('boom'), { context: 'test' });
    expect(errorSpy).toHaveBeenCalled();
  });

  it('captureMessage routes to logger.warn', async () => {
    const warnSpy = jest.fn();
    jest.doMock('@/lib/logger', () => ({
      logger: { error: jest.fn(), warn: warnSpy, info: jest.fn() },
    }));
    const mod = await import('@/lib/sentry');
    mod.captureMessage('hello', { x: 1 });
    expect(warnSpy).toHaveBeenCalled();
  });

  it('initSentry is idempotent + safe with no DSN', async () => {
    jest.doMock('@/lib/logger', () => ({
      logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
    }));
    const mod = await import('@/lib/sentry');
    await expect(mod.initSentry('nodejs')).resolves.toBeUndefined();
    await expect(mod.initSentry('nodejs')).resolves.toBeUndefined();
  });

  it('setSentryUser is a no-op without binding', async () => {
    jest.doMock('@/lib/logger', () => ({
      logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
    }));
    const mod = await import('@/lib/sentry');
    expect(() => mod.setSentryUser({ id: 'u1' })).not.toThrow();
    expect(() => mod.setSentryUser(null)).not.toThrow();
  });
});
