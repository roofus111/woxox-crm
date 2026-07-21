import express, { type Express, type RequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { env, isProduction, s3FullyConfigured } from './config/env.js';
import { ApiError } from './common/ApiError.js';
import { errorHandler, notFoundHandler } from './common/error.middleware.js';
import { logger } from './common/logger.js';
import { ok } from './common/response.js';
import { legalRouter } from './modules/legal/legal.router.js';
import { authRouter } from './modules/auth/auth.router.js';

const moduleGuard: RequestHandler = (_req, _res, next) => {
  if (!env.LEGALOS_ENABLED) {
    return next(ApiError.moduleDisabled());
  }
  next();
};

export function createApp(): Express {
  const app = express();

  if (env.TRUST_PROXY || isProduction) {
    app.set('trust proxy', 1);
  }

  app.disable('x-powered-by');
  app.use(
    helmet({
      contentSecurityPolicy: isProduction ? undefined : false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Workspace-Id', 'X-Correlation-Id'],
    }),
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));

  if (isProduction) {
    app.use(
      morgan('combined', {
        stream: { write: (line) => logger.info(line.trim()) },
      }),
    );
  } else {
    app.use(morgan('dev'));
  }

  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
    }),
  );

  const authLimiter = rateLimit({
    windowMs: 60_000,
    max: isProduction ? 20 : 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: { code: 'RATE_LIMITED', message: 'Too many auth attempts' },
    },
  });

  app.get('/health', (_req, res) => {
    res.json(
      ok({
        status: 'ok',
        module: 'legalos',
        enabled: env.LEGALOS_ENABLED,
        env: env.NODE_ENV,
      }),
    );
  });

  app.get('/ready', (_req, res) => {
    const mongoReady = mongoose.connection.readyState === 1;
    const s3Ok = !env.LEGALOS_REQUIRE_S3 || s3FullyConfigured;
    const ready = mongoReady && s3Ok && env.LEGALOS_ENABLED;

    res.status(ready ? 200 : 503).json(
      ok({
        status: ready ? 'ready' : 'not_ready',
        checks: {
          mongo: mongoReady ? 'up' : 'down',
          s3: s3Ok ? 'ok' : 'missing',
          module: env.LEGALOS_ENABLED ? 'enabled' : 'disabled',
        },
      }),
    );
  });

  app.use('/api/v1/auth', authLimiter, authRouter);
  app.use('/api/v1/legal', moduleGuard, legalRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
