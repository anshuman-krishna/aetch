import { logger } from '@/lib/logger';

// thin wrapper that no-ops without SENTRY_DSN.
// when @sentry/nextjs is installed and SENTRY_DSN is set, the dynamic import binds it.

interface SentryShape {
  init: (cfg: Record<string, unknown>) => void;
  captureException: (err: unknown, ctx?: Record<string, unknown>) => void;
  captureMessage: (msg: string, ctx?: Record<string, unknown>) => void;
  setUser: (user: { id?: string; email?: string } | null) => void;
}

let bound: SentryShape | null = null;
let initialized = false;

async function loadSentry(): Promise<SentryShape | null> {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return null;
  try {
    // optional dependency; dynamic specifier hides the import from ts/webpack static analysis
    const specifier = ['@sentry', 'nextjs'].join('/');
    const mod = (await import(/* webpackIgnore: true */ specifier).catch(
      () => null,
    )) as SentryShape | null;
    return mod;
  } catch {
    return null;
  }
}

export async function initSentry(runtime: 'nodejs' | 'edge'): Promise<void> {
  if (initialized) return;
  initialized = true;
  const sentry = await loadSentry();
  if (!sentry) return;
  bound = sentry;
  bound.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release: process.env.SENTRY_RELEASE,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
    ...(runtime === 'edge' ? {} : { profilesSampleRate: 0 }),
  });
  logger.info({ runtime }, 'sentry initialized');
}

export function captureException(err: unknown, ctx?: Record<string, unknown>): void {
  if (bound) {
    bound.captureException(err, ctx);
    return;
  }
  // structured fallback so log shipping still surfaces it
  logger.error({ err, ctx }, 'captureException (sentry not bound)');
}

export function captureMessage(msg: string, ctx?: Record<string, unknown>): void {
  if (bound) {
    bound.captureMessage(msg, ctx);
    return;
  }
  logger.warn({ ctx }, msg);
}

export function setSentryUser(user: { id?: string; email?: string } | null): void {
  bound?.setUser(user);
}
