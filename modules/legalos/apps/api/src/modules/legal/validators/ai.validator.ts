import { z } from 'zod';
import { AI_TASKS } from '../enums.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId');

export const aiRequestDto = z
  .object({
    task: z.enum(AI_TASKS),
    prompt: z.string().trim().min(1).max(20000).optional(),
    locale: z.string().trim().default('en-IN'),
    caseId: objectId.optional(),
    sourceIds: z
      .array(
        z.object({
          type: z.enum(['case', 'evidence', 'research', 'document']),
          id: z.string().trim().min(1),
        }),
      )
      .optional(),
    redact: z.boolean().default(true),
  })
  .strict();

export type AiRequestInput = z.infer<typeof aiRequestDto>;
