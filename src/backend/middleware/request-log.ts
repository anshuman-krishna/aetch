import { logger } from '@/lib/logger';

// log api request in dev
export function logRequest(req: Request, extra?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'production') return;

  const url = new URL(req.url);
  logger.debug(
    {
      method: req.method,
      path: url.pathname,
      search: url.search || undefined,
      ...extra,
    },
    'api request',
  );
}
