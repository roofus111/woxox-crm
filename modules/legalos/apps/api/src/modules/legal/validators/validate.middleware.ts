import type { RequestHandler } from 'express';
import type { ZodSchema } from 'zod';
import { ApiError } from '../../../common/ApiError.js';

export function validateBody<T>(schema: ZodSchema<T>): RequestHandler {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return next(ApiError.validation('Request body validation failed', parsed.error.flatten()));
    }
    req.validatedBody = parsed.data;
    next();
  };
}

export function validateQuery<T>(schema: ZodSchema<T>): RequestHandler {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      return next(ApiError.validation('Query validation failed', parsed.error.flatten()));
    }
    req.validatedQuery = parsed.data;
    next();
  };
}

export function validateParams<T>(schema: ZodSchema<T>): RequestHandler {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req.params);
    if (!parsed.success) {
      return next(ApiError.validation('Route params validation failed', parsed.error.flatten()));
    }
    req.validatedParams = parsed.data;
    next();
  };
}
