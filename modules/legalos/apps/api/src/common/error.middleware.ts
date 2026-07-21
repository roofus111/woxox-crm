import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { ApiError } from './ApiError.js';
import { isProduction } from '../config/env.js';
import { logger } from './logger.js';
import { fail } from './response.js';

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json(fail('NOT_FOUND', 'Route not found'));
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof ApiError) {
    const details = isProduction ? undefined : err.details;
    return res.status(err.statusCode).json(fail(err.code, err.message, details));
  }

  if (err instanceof ZodError || (err && typeof err === 'object' && 'name' in err && err.name === 'ZodError')) {
    const details = isProduction ? undefined : err;
    return res.status(422).json(fail('VALIDATION_ERROR', 'Validation failed', details));
  }

  if (err && typeof err === 'object' && 'code' in err && err.code === 11000) {
    return res.status(409).json(fail('CONFLICT', 'Duplicate key violation'));
  }

  logger.error('Unhandled error', {
    correlationId: req.correlationId,
    err: err instanceof Error ? err.message : String(err),
    stack: isProduction ? undefined : err instanceof Error ? err.stack : undefined,
  });
  return res.status(500).json(fail('INTERNAL_ERROR', 'Internal server error'));
};
