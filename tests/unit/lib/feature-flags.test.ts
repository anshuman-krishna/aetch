describe('feature-flags', () => {
  const ORIGINAL = process.env;

  afterEach(() => {
    process.env = { ...ORIGINAL };
    jest.resetModules();
  });

  it('respects env overrides (true / false)', () => {
    process.env.FF_AI_GENERATION = 'true';
    process.env.FF_BOOKING = 'false';
    jest.resetModules();
    const flags = require('@/lib/feature-flags');
    expect(flags.isFeatureEnabled('AI_GENERATION_ENABLED')).toBe(true);
    expect(flags.isFeatureEnabled('BOOKING_ENABLED')).toBe(false);
  });

  it('treats "1" as true', () => {
    process.env.FF_AR_PREVIEW = '1';
    jest.resetModules();
    const flags = require('@/lib/feature-flags');
    expect(flags.isFeatureEnabled('AR_PREVIEW_ENABLED')).toBe(true);
  });

  it('defaults SOCIAL_FEED + BOOKING to true when unset', () => {
    delete process.env.FF_SOCIAL_FEED;
    delete process.env.FF_BOOKING;
    jest.resetModules();
    const flags = require('@/lib/feature-flags');
    expect(flags.isFeatureEnabled('SOCIAL_FEED_ENABLED')).toBe(true);
    expect(flags.isFeatureEnabled('BOOKING_ENABLED')).toBe(true);
  });

  it('getFeatureFlags returns a copy with all keys', () => {
    jest.resetModules();
    const flags = require('@/lib/feature-flags');
    const all = flags.getFeatureFlags();
    expect(Object.keys(all).sort()).toEqual(
      [
        'AFTERCARE_AI_ENABLED',
        'AI_GENERATION_ENABLED',
        'AR_PREVIEW_ENABLED',
        'BOOKING_ENABLED',
        'COLLECTIONS_ENABLED',
        'COVERUP_ENABLED',
        'MESSAGING_ENABLED',
        'PRICE_ESTIMATOR_ENABLED',
        'SOCIAL_FEED_ENABLED',
      ].sort(),
    );
  });
});
