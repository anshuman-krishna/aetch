const flags = {
  AI_GENERATION_ENABLED: env('FF_AI_GENERATION', false),
  AR_PREVIEW_ENABLED: env('FF_AR_PREVIEW', false),
  PRICE_ESTIMATOR_ENABLED: env('FF_PRICE_ESTIMATOR', false),
  MESSAGING_ENABLED: env('FF_MESSAGING', false),
  SOCIAL_FEED_ENABLED: env('FF_SOCIAL_FEED', true),
  BOOKING_ENABLED: env('FF_BOOKING', true),
} as const;

function env(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
}

export type FeatureFlag = keyof typeof flags;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return flags[flag];
}

export function getFeatureFlags(): Record<FeatureFlag, boolean> {
  return { ...flags };
}
