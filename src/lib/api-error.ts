import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

interface ApiErrorOptions {
  status: number;
  error: string;
  details?: unknown;
}

// consistent api error response
export function apiError({ status, error, details }: ApiErrorOptions) {
  return NextResponse.json(
    { success: false, error, ...(details ? { details } : {}) },
    { status },
  );
}

// common error shortcuts
export const errors = {
  badRequest: (msg = 'Bad request', details?: unknown) =>
    apiError({ status: 400, error: msg, details }),
  unauthorized: (msg = 'Unauthorized') =>
    apiError({ status: 401, error: msg }),
  forbidden: (msg = 'Forbidden') =>
    apiError({ status: 403, error: msg }),
  notFound: (msg = 'Not found') =>
    apiError({ status: 404, error: msg }),
  conflict: (msg = 'Conflict') =>
    apiError({ status: 409, error: msg }),
  tooMany: (msg = 'Too many requests') =>
    apiError({ status: 429, error: msg }),
  internal: (msg = 'Internal server error') =>
    apiError({ status: 500, error: msg }),
} as const;

// log and return 500
export function handleApiError(err: unknown, context?: string) {
  const isPrismaError =
    err instanceof Error && err.constructor.name.startsWith('Prisma');
  logger.error(
    {
      err,
      context,
      type: isPrismaError ? 'database' : 'unexpected',
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    },
    isPrismaError ? 'database error' : 'api error',
  );
  return errors.internal();
}

// wrap async route handler with error catching
export function withErrorHandler(
  handler: (req: Request, ctx?: unknown) => Promise<Response>,
  context?: string,
) {
  return async (req: Request, ctx?: unknown) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      return handleApiError(err, context ?? new URL(req.url).pathname);
    }
  };
}
