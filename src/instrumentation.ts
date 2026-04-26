// next.js instrumentation hook
export async function register() {
  const { initSentry } = await import('@/lib/sentry');

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { logger } = await import('@/lib/logger');
    await initSentry('nodejs');

    process.on('unhandledRejection', (reason) => {
      logger.error({ err: reason }, 'unhandled rejection');
    });

    process.on('uncaughtException', (err) => {
      logger.fatal({ err }, 'uncaught exception');
    });

    logger.info('instrumentation registered');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await initSentry('edge');
  }
}

// next 15+ supports a request-error hook surfaced from instrumentation
export async function onRequestError(
  err: unknown,
  request: { path: string; method: string; headers: Record<string, string> },
) {
  const { captureException } = await import('@/lib/sentry');
  captureException(err, {
    requestId: request.headers['x-request-id'],
    path: request.path,
    method: request.method,
  });
}
