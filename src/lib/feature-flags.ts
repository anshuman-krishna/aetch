const flags = {
  AI_GENERATION_ENABLED: env('FF_AI_GENERATION', false),
  AR_PREVIEW_ENABLED: env('FF_AR_PREVIEW', false),
  PRICE_ESTIMATOR_ENABLED: env('FF_PRICE_ESTIMATOR', true),
  MESSAGING_ENABLED: env('FF_MESSAGING', false),
  SOCIAL_FEED_ENABLED: env('FF_SOCIAL_FEED', true),
  BOOKING_ENABLED: env('FF_BOOKING', true),
  COVERUP_ENABLED: env('FF_COVERUP', false),
  AFTERCARE_AI_ENABLED: env('FF_AFTERCARE', false),
  COLLECTIONS_ENABLED: env('FF_COLLECTIONS', true),
  LONGEVITY_ENABLED: env('FF_LONGEVITY', false),
  STYLE_DNA_ENABLED: env('FF_STYLE_DNA', false),
  EVENTS_ENABLED: env('FF_EVENTS', true),
  LEARN_ENABLED: env('FF_LEARN', true),
  MAP_ENABLED: env('FF_MAP', true),
  WEB_PUSH_ENABLED: env('FF_WEB_PUSH', false),
  LINK_PREVIEWS_ENABLED: env('FF_LINK_PREVIEWS', true),
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
