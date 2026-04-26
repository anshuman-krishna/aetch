import { logger } from '@/lib/logger';

// get or generate a request id
export function getRequestId(req: Request): string {
  return (
    req.headers.get('x-request-id') ??
    req.headers.get('x-correlation-id') ??
    globalThis.crypto?.randomUUID?.() ??
    Math.random().toString(36).slice(2)
  );
}

// child logger with request-scoped context
export function requestLogger(req: Request, extra?: Record<string, unknown>) {
  const requestId = getRequestId(req);
  const url = new URL(req.url);
  return logger.child({
    requestId,
    method: req.method,
    path: url.pathname,
    ...(extra ?? {}),
  });
}

// log api request in dev
export function logRequest(req: Request, extra?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'production') return;

  const url = new URL(req.url);
  logger.debug(
    {
      requestId: getRequestId(req),
      method: req.method,
      path: url.pathname,
      search: url.search || undefined,
      ...extra,
    },
    'api request',
  );
}

// attach request id header onto a response
export function withRequestId(req: Request, res: Response): Response {
  const requestId = getRequestId(req);
  res.headers.set('x-request-id', requestId);
  return res;
}
