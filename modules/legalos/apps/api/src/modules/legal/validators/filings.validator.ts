import { z } from 'zod';
import { FILING_STATUSES } from '../models/filing.model.js';
import { paginationQuerySchema } from '../../../common/pagination.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId');

export const createFilingDto = z
  .object({
    caseId: objectId,
    title: z.string().trim().min(1).max(300),
    filingType: z.string().trim().min(1).max(100),
    status: z.enum(FILING_STATUSES).optional(),
    checklist: z
      .array(z.object({ item: z.string().min(1), done: z.boolean().optional() }))
      .optional(),
    courtFees: z.number().nonnegative().optional(),
    stampDuty: z.number().nonnegative().optional(),
    diaryNumber: z.string().trim().optional(),
    notes: z.string().max(5000).optional(),
  })
  .strict();

export const updateFilingDto = createFilingDto.partial().omit({ caseId: true }).strict().extend({
  defects: z
    .array(
      z.object({
        note: z.string(),
        raisedAt: z.coerce.date().optional(),
        resolvedAt: z.coerce.date().optional(),
      }),
    )
    .optional(),
  registryObjections: z
    .array(z.object({ note: z.string(), raisedAt: z.coerce.date().optional() }))
    .optional(),
});

export const filingListParams = paginationQuerySchema.extend({
  caseId: objectId.optional(),
  status: z.enum(FILING_STATUSES).optional(),
});

export const filingIdParams = z.object({ id: objectId }).strict();

export type CreateFilingInput = z.infer<typeof createFilingDto>;
export type UpdateFilingInput = z.infer<typeof updateFilingDto>;
export type FilingListParams = z.infer<typeof filingListParams>;
