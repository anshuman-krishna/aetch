import { apiError, errors, withErrorHandler } from '@/lib/api-error';

jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

async function body(res: Response) {
  return res.json();
}

describe('apiError', () => {
  it('returns status + error + success:false', async () => {
    const res = apiError({ status: 418, error: 'teapot' });
    expect(res.status).toBe(418);
    expect(await body(res)).toEqual({ success: false, error: 'teapot' });
  });

  it('includes details when supplied', async () => {
    const res = apiError({ status: 400, error: 'bad', details: { field: 'name' } });
    expect(await body(res)).toMatchObject({ details: { field: 'name' } });
  });
});

describe('errors shortcuts', () => {
  it.each([
    ['badRequest', 400],
    ['unauthorized', 401],
    ['forbidden', 403],
    ['notFound', 404],
    ['conflict', 409],
    ['tooMany', 429],
    ['internal', 500],
  ] as const)('%s returns status %i', (key, status) => {
    const res = (errors as Record<string, () => Response>)[key]!();
    expect(res.status).toBe(status);
  });
});

describe('withErrorHandler', () => {
  it('passes through a successful response', async () => {
    const handler = withErrorHandler(async () => Response.json({ ok: true }));
    const res = await handler(new Request('http://localhost/api/x'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it('catches thrown errors and returns 500', async () => {
    const handler = withErrorHandler(async () => {
      throw new Error('boom');
    });
    const res = await handler(new Request('http://localhost/api/x'));
    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ success: false });
  });
});
