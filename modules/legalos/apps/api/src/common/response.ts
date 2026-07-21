import type { Response } from 'express';

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  hasMore?: boolean;
  cursor?: string | null;
  [key: string]: unknown;
}

export interface ApiSuccessEnvelope<T> {
  success: true;
  data: T;
  meta?: ApiMeta;
}

export interface ApiFailureEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function ok<T>(data: T, meta?: ApiMeta): ApiSuccessEnvelope<T> {
  return meta ? { success: true, data, meta } : { success: true, data };
}

export function fail(
  code: string,
  message: string,
  details?: unknown,
): ApiFailureEnvelope {
  return {
    success: false,
    error: { code, message, ...(details !== undefined ? { details } : {}) },
  };
}

export function sendOk<T>(res: Response, data: T, status = 200, meta?: ApiMeta): Response {
  return res.status(status).json(ok(data, meta));
}

export function sendCreated<T>(res: Response, data: T, meta?: ApiMeta): Response {
  return sendOk(res, data, 201, meta);
}
