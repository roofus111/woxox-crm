import type { RequestHandler } from 'express';

export type AsyncRequestHandler = (
  ...args: Parameters<RequestHandler>
) => Promise<void | unknown>;

export function asyncHandler(fn: AsyncRequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
