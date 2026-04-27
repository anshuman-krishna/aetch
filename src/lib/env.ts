import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  AUTH_TRUST_HOST: z.string().optional(),
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),

  // optional services
  EMAIL_SERVER_HOST: z.string().optional(),
  EMAIL_SERVER_PORT: z.string().optional(),
  EMAIL_SERVER_USER: z.string().optional(),
  EMAIL_SERVER_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  S3_ENDPOINT: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),

  MEILISEARCH_HOST: z.string().optional(),
  MEILISEARCH_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  AI_IMAGE_MODEL: z.string().default('dall-e-3'),
  AI_MAX_REQUESTS_PER_HOUR: z.coerce.number().int().positive().default(10),

  // feature flags
  FF_AI_GENERATION: z.string().optional(),
  FF_AR_PREVIEW: z.string().optional(),
  FF_PRICE_ESTIMATOR: z.string().optional(),
  FF_MESSAGING: z.string().optional(),
  FF_SOCIAL_FEED: z.string().optional(),
  FF_BOOKING: z.string().optional(),
  FF_COVERUP: z.string().optional(),
  FF_AFTERCARE: z.string().optional(),
  FF_COLLECTIONS: z.string().optional(),
  FF_LONGEVITY: z.string().optional(),
  FF_STYLE_DNA: z.string().optional(),
  FF_EVENTS: z.string().optional(),
  FF_LEARN: z.string().optional(),
  FF_MAP: z.string().optional(),
  FF_WEB_PUSH: z.string().optional(),
  FF_LINK_PREVIEWS: z.string().optional(),

  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),

  // observability
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_RELEASE: z.string().optional(),
  SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).optional(),

  // av scan webhook
  AV_SCAN_WEBHOOK_URL: z.string().url().optional(),
  AV_SCAN_WEBHOOK_TOKEN: z.string().optional(),

  // 2fa enforcement
  TOTP_ISSUER: z.string().default('AETCH'),

  // cron auth (vercel + manual triggers)
  CRON_SECRET: z.string().optional(),

  // direct (non-pooled) database url for prisma migrate / cron / long-running jobs
  DATABASE_URL_DIRECT: z.string().optional(),

  // socket auth jwt — short-lived bearer for horizontal scale
  SOCKET_JWT_SECRET: z.string().optional(),

  // web push (vapid)
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().optional(),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),

  // map provider (maplibre uses no key by default; mapbox optional)
  NEXT_PUBLIC_MAP_STYLE_URL: z.string().optional(),
  NEXT_PUBLIC_MAPBOX_TOKEN: z.string().optional(),

  // replicate (for clip embeddings + longevity)
  REPLICATE_API_TOKEN: z.string().optional(),
  REPLICATE_CLIP_MODEL: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

export function validateEnv(): Env {
  if (_env) return _env;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    throw new Error(`Environment validation failed:\n${formatted}`);
  }

  _env = result.data;
  return _env;
}

export function getEnv(): Env {
  if (_env) return _env;
  return validateEnv();
}
