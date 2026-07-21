import { z } from 'zod';
import { CASE_STATUSES, PRACTICE_AREAS } from '../enums.js';
import { paginationQuerySchema } from '../../../common/pagination.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId');

const courtSchema = z
  .object({
    cino: z.string().trim().optional(),
    name: z.string().trim().optional(),
    state: z.string().trim().optional(),
    district: z.string().trim().optional(),
    courtNumber: z.string().trim().optional(),
    judgeName: z.string().trim().optional(),
  })
  .strict();

export const createCaseDto = z
  .object({
    title: z.string().trim().min(1).max(300),
    caseNumber: z.string().trim().max(100).optional(),
    status: z.enum(CASE_STATUSES).optional(),
    court: courtSchema.optional(),
    clientPartyIds: z.array(objectId).optional(),
    oppositePartyIds: z.array(objectId).optional(),
    advocateIds: z.array(objectId).optional(),
    practiceArea: z.enum(PRACTICE_AREAS),
    nextHearingAt: z.coerce.date().optional(),
    openedAt: z.coerce.date().optional(),
    summary: z.string().max(10000).optional(),
    tags: z.array(z.string().trim()).optional(),
  })
  .strict();

export const updateCaseDto = createCaseDto.partial().strict();

export const caseListParams = paginationQuerySchema.extend({
  status: z.enum(CASE_STATUSES).optional(),
  practiceArea: z.enum(PRACTICE_AREAS).optional(),
  clientPartyId: objectId.optional(),
});

export const caseIdParams = z.object({ id: objectId }).strict();

export type CreateCaseInput = z.infer<typeof createCaseDto>;
export type UpdateCaseInput = z.infer<typeof updateCaseDto>;
export type CaseListParams = z.infer<typeof caseListParams>;
