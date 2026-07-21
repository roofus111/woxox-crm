import { z } from 'zod';

import { AiTask } from '../enums';
import { objectIdSchema } from './cases';

const aiSourceScopeSchema = z.object({
  caseIds: z.array(objectIdSchema).default([]),
  complaintIds: z.array(objectIdSchema).default([]),
  firIds: z.array(objectIdSchema).default([]),
  evidenceIds: z.array(objectIdSchema).default([]),
  researchDocumentRefs: z.array(z.string().trim().min(1).max(500)).default([]),
});

/** Request body for POST /ai/requests. */
export const aiRequestDto = z.object({
  task: z.nativeEnum(AiTask),
  prompt: z.string().trim().min(1).max(20_000),
  locale: z.string().trim().min(2).max(10).default('en-IN'),
  sourceScope: aiSourceScopeSchema.default({
    caseIds: [],
    complaintIds: [],
    firIds: [],
    evidenceIds: [],
    researchDocumentRefs: [],
  }),
  options: z
    .object({
      redactPii: z.boolean().default(true),
      includeCitations: z.boolean().default(true),
      maxTokens: z.number().int().min(256).max(16_384).optional(),
      temperature: z.number().min(0).max(1).optional(),
      reviewRequired: z.boolean().default(true),
    })
    .default({
      redactPii: true,
      includeCitations: true,
      reviewRequired: true,
    }),
  correlationId: z.string().trim().max(100).optional(),
});

export type AiRequestDto = z.infer<typeof aiRequestDto>;
