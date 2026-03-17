// next.js instrumentation hook
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { logger } = await import('@/lib/logger');

    process.on('unhandledRejection', (reason) => {
      logger.error({ err: reason }, 'unhandled rejection');
    });

    process.on('uncaughtException', (err) => {
      logger.fatal({ err }, 'uncaught exception');
    });

    logger.info('instrumentation registered');
  }
}
