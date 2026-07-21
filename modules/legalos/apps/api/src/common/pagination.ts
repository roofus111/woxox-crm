import type { Request } from 'express';
import { z } from 'zod';

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  direction: z.enum(['asc', 'desc']).default('desc'),
  q: z.string().trim().optional(),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  [key: string]: unknown;
}

export function parsePagination(req: Request): PaginationQuery {
  return paginationQuerySchema.parse(req.query);
}

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  return {
    page,
    limit,
    total,
    hasMore: page * limit < total,
  };
}

export function paginationSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}

export function buildSort(
  sort?: string,
  direction: 'asc' | 'desc' = 'desc',
  defaultSort: Record<string, 1 | -1> = { createdAt: -1 },
): Record<string, 1 | -1> {
  if (!sort) {
    return defaultSort;
  }

  const allowed = new Set([
    'createdAt',
    'updatedAt',
    'nextHearingAt',
    'scheduledAt',
    'incidentDate',
    'status',
    'title',
    'caseNumber',
    'complaintNumber',
    'firNumber',
  ]);

  if (!allowed.has(sort)) {
    return defaultSort;
  }

  return { [sort]: direction === 'asc' ? 1 : -1, _id: -1 };
}

export function buildTextSearchFilter(q?: string, fields: string[] = []): Record<string, unknown> {
  if (!q || fields.length === 0) {
    return {};
  }

  const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  return {
    $or: fields.map((field) => ({ [field]: regex })),
  };
}
