import { z } from 'zod';
import { HEARING_STATUSES } from '../enums.js';
import { paginationQuerySchema } from '../../../common/pagination.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId');

export const createHearingDto = z
  .object({
    title: z.string().trim().min(1).max(300),
    scheduledAt: z.coerce.date(),
    status: z.enum(HEARING_STATUSES).optional(),
    court: z
      .object({
        name: z.string().trim().optional(),
        courtNumber: z.string().trim().optional(),
        judgeName: z.string().trim().optional(),
        bench: z.string().trim().optional(),
      })
      .strict()
      .optional(),
    assignedAdvocateIds: z.array(objectId).optional(),
    purpose: z.string().trim().optional(),
    notes: z.string().max(5000).optional(),
  })
  .strict();

export const hearingListParams = paginationQuerySchema.extend({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  caseId: objectId.optional(),
  status: z.enum(HEARING_STATUSES).optional(),
});

export const caseHearingParams = z
  .object({
    id: objectId,
  })
  .strict();

export type CreateHearingInput = z.infer<typeof createHearingDto>;
export type HearingListParams = z.infer<typeof hearingListParams>;
