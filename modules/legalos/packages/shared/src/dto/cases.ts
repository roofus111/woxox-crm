import { z } from 'zod';

import { CaseStatus, PracticeArea, ProviderId } from '../enums';

/** MongoDB ObjectId string validator. */
export const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId');

/** Embedded court snapshot stored on cases and hearings. */
export const courtSnapshotSchema = z.object({
  cino: z.string().trim().max(50).optional(),
  name: z.string().trim().max(200).optional(),
  state: z.string().trim().max(100).optional(),
  district: z.string().trim().max(100).optional(),
  courtNumber: z.string().trim().max(50).optional(),
  judgeName: z.string().trim().max(200).optional(),
});

export type CourtSnapshot = z.infer<typeof courtSnapshotSchema>;

/** External provider cross-reference on a case record. */
export const providerRefSchema = z.object({
  provider: z.nativeEnum(ProviderId),
  externalKey: z.string().trim().min(1).max(500),
});

export type ProviderRef = z.infer<typeof providerRefSchema>;

/** Request body for POST /cases. */
export const createCaseDto = z.object({
  title: z.string().trim().min(1, 'Title is required').max(300),
  caseNumber: z.string().trim().max(100).optional(),
  status: z.nativeEnum(CaseStatus).default(CaseStatus.Active),
  court: courtSnapshotSchema.optional(),
  clientPartyIds: z.array(objectIdSchema).min(1, 'At least one client party is required'),
  oppositePartyIds: z.array(objectIdSchema).default([]),
  advocateIds: z.array(objectIdSchema).default([]),
  practiceArea: z.nativeEnum(PracticeArea),
  nextHearingAt: z.coerce.date().optional(),
  providerRefs: z.array(providerRefSchema).default([]),
  description: z.string().trim().max(5000).optional(),
  openedAt: z.coerce.date().optional(),
  tags: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
});

export type CreateCaseDto = z.infer<typeof createCaseDto>;

/** Request body for PATCH /cases/:id. */
export const updateCaseDto = createCaseDto
  .partial()
  .extend({
    status: z.nativeEnum(CaseStatus).optional(),
    practiceArea: z.nativeEnum(PracticeArea).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided for update',
  });

export type UpdateCaseDto = z.infer<typeof updateCaseDto>;

const sortDirectionSchema = z.enum(['asc', 'desc']);

/** Query parameters for GET /cases. */
export const caseListParams = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(200).optional(),
  sort: z
    .enum([
      'createdAt',
      'updatedAt',
      'nextHearingAt',
      'caseNumber',
      'title',
      'status',
      'practiceArea',
    ])
    .default('nextHearingAt'),
  direction: sortDirectionSchema.default('asc'),
  status: z.nativeEnum(CaseStatus).optional(),
  practiceArea: z.nativeEnum(PracticeArea).optional(),
  advocateId: objectIdSchema.optional(),
  clientPartyId: objectIdSchema.optional(),
  courtCino: z.string().trim().max(50).optional(),
  nextHearingFrom: z.coerce.date().optional(),
  nextHearingTo: z.coerce.date().optional(),
  includeArchived: z.coerce.boolean().default(false),
});

export type CaseListParams = z.infer<typeof caseListParams>;
