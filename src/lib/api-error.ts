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
  logger.error({ err, context }, 'api error');
  return errors.internal();
}
