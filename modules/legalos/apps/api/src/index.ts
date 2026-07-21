import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env, isProduction } from './config/env.js';
import { logger } from './common/logger.js';
import { startBackgroundJobs, stopBackgroundJobs } from './jobs/index.js';
import { seedDemoDataIfEmpty } from './dev/seed-demo.js';
import { socketEmitter } from './host/socket.emitter.js';

const SHUTDOWN_MS = 25_000;

async function bootstrap(): Promise<void> {
  await connectDatabase();

  if (!isProduction) {
    await seedDemoDataIfEmpty();
  }

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info('API listening', {
      port: env.PORT,
      env: env.NODE_ENV,
      legalRoutes: '/api/v1/legal',
      authRoutes: '/api/v1/auth',
    });
  });

  socketEmitter.attach(server);
  startBackgroundJobs();

  let shuttingDown = false;
  const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info('Shutting down', { signal });
    stopBackgroundJobs();

    const force = setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, SHUTDOWN_MS);
    force.unref();

    server.close(async () => {
      try {
        await disconnectDatabase();
        process.exit(0);
      } catch (err) {
        logger.error('Shutdown error', { err: err instanceof Error ? err.message : String(err) });
        process.exit(1);
      }
    });
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  logger.error('Failed to start', { err: err instanceof Error ? err.message : String(err) });
  process.exit(1);
});
