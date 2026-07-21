import { z } from 'zod';

import { ProviderId } from '../enums';
import { objectIdSchema } from './cases';

const providerEntityTypeSchema = z.enum([
  'case',
  'hearing',
  'order',
  'judgment',
  'cause_list',
  'complaint',
  'fir',
]);

/** Request body for POST /providers/:provider/sync. */
export const syncRequestDto = z.object({
  entityType: providerEntityTypeSchema,
  entityId: objectIdSchema.optional(),
  externalKey: z.string().trim().min(1).max(500).optional(),
  force: z.boolean().default(false),
  correlationId: z.string().trim().max(100).optional(),
});

export type SyncRequestDto = z.infer<typeof syncRequestDto>;

const researchDocumentTypeSchema = z.enum([
  'judgment',
  'order',
  'bare_act',
  'citation',
  'commentary',
  'all',
]);

/** Request body for licensed legal research queries. */
export const researchQueryDto = z.object({
  provider: z.union([
    z.literal(ProviderId.SccOnline),
    z.literal(ProviderId.Manupatra),
  ]),
  query: z.string().trim().min(1).max(1000),
  documentType: researchDocumentTypeSchema.default('all'),
  court: z.string().trim().max(200).optional(),
  bench: z.string().trim().max(200).optional(),
  judge: z.string().trim().max(200).optional(),
  yearFrom: z.coerce.number().int().min(1800).max(2100).optional(),
  yearTo: z.coerce.number().int().min(1800).max(2100).optional(),
  act: z.string().trim().max(300).optional(),
  section: z.string().trim().max(100).optional(),
  citation: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type ResearchQueryDto = z.infer<typeof researchQueryDto>;
