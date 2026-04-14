describe('env validation', () => {
  const ORIGINAL = process.env;

  const baseline = {
    DATABASE_URL: 'postgresql://u:p@localhost:5432/aetch',
    NEXTAUTH_URL: 'http://localhost:3000',
    NEXTAUTH_SECRET: 'a'.repeat(32),
    GOOGLE_CLIENT_ID: 'google-id',
    GOOGLE_CLIENT_SECRET: 'google-secret',
  };

  afterEach(() => {
    process.env = { ...ORIGINAL };
    jest.resetModules();
  });

  it('validates with required fields present', () => {
    process.env = { ...ORIGINAL, ...baseline };
    jest.resetModules();
    const { validateEnv } = require('@/lib/env');
    const env = validateEnv();
    expect(env.DATABASE_URL).toBe(baseline.DATABASE_URL);
    expect(env.NEXTAUTH_SECRET).toBe(baseline.NEXTAUTH_SECRET);
  });

  it('throws when DATABASE_URL missing', () => {
    process.env = { ...ORIGINAL, ...baseline } as NodeJS.ProcessEnv;
    delete process.env.DATABASE_URL;
    jest.resetModules();
    const { validateEnv } = require('@/lib/env');
    expect(() => validateEnv()).toThrow(/DATABASE_URL/);
  });

  it('throws when NEXTAUTH_URL is malformed', () => {
    process.env = { ...ORIGINAL, ...baseline, NEXTAUTH_URL: 'not-a-url' };
    jest.resetModules();
    const { validateEnv } = require('@/lib/env');
    expect(() => validateEnv()).toThrow(/NEXTAUTH_URL/);
  });

  it('coerces AI_MAX_REQUESTS_PER_HOUR to number with default', () => {
    process.env = { ...ORIGINAL, ...baseline };
    delete process.env.AI_MAX_REQUESTS_PER_HOUR;
    jest.resetModules();
    const { validateEnv } = require('@/lib/env');
    expect(validateEnv().AI_MAX_REQUESTS_PER_HOUR).toBe(10);

    process.env.AI_MAX_REQUESTS_PER_HOUR = '42';
    jest.resetModules();
    const { validateEnv: validate2 } = require('@/lib/env');
    expect(validate2().AI_MAX_REQUESTS_PER_HOUR).toBe(42);
  });

  it('applies default AI_IMAGE_MODEL', () => {
    process.env = { ...ORIGINAL, ...baseline };
    delete process.env.AI_IMAGE_MODEL;
    jest.resetModules();
    const { validateEnv } = require('@/lib/env');
    expect(validateEnv().AI_IMAGE_MODEL).toBe('dall-e-3');
  });
});
