import { z } from 'zod';
import { BAIL_STATUSES, FIR_STATUSES } from '../enums.js';
import { paginationQuerySchema } from '../../../common/pagination.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId');

export const createFirDto = z
  .object({
    firNumber: z.string().trim().min(1).max(50),
    policeStation: z.string().trim().min(1).max(200),
    status: z.enum(FIR_STATUSES).optional(),
    bailStatus: z.enum(BAIL_STATUSES).optional(),
    registeredAt: z.coerce.date().optional(),
    actsAndSections: z
      .array(
        z.object({
          act: z.string().trim().min(1),
          sections: z.array(z.string().trim()).default([]),
        }),
      )
      .optional(),
    clientPartyId: objectId.optional(),
    accusedPartyIds: z.array(objectId).optional(),
    victimPartyIds: z.array(objectId).optional(),
    officerPartyId: objectId.optional(),
    investigationOfficer: z.string().trim().optional(),
    linkedCaseId: objectId.optional(),
    sourceComplaintId: objectId.optional(),
    summary: z.string().max(10000).optional(),
    tags: z.array(z.string().trim()).optional(),
  })
  .strict();

export const firListParams = paginationQuerySchema.extend({
  status: z.enum(FIR_STATUSES).optional(),
  bailStatus: z.enum(BAIL_STATUSES).optional(),
  policeStationKey: z.string().trim().optional(),
});

export const firIdParams = z.object({ id: objectId }).strict();

export const updateFirDto = z
  .object({
    status: z.enum(FIR_STATUSES).optional(),
    bailStatus: z.enum(BAIL_STATUSES).optional(),
    chargeSheet: z
      .object({
        filedAt: z.coerce.date().optional(),
        referenceNumber: z.string().trim().optional(),
        notes: z.string().max(5000).optional(),
      })
      .strict()
      .optional(),
    closureReport: z
      .object({
        reportedAt: z.coerce.date().optional(),
        type: z.string().trim().optional(),
        notes: z.string().max(5000).optional(),
      })
      .strict()
      .optional(),
    courtTransfer: z
      .object({
        transferredAt: z.coerce.date().optional(),
        courtName: z.string().trim().optional(),
        caseNumber: z.string().trim().optional(),
        notes: z.string().max(5000).optional(),
      })
      .strict()
      .optional(),
    investigationOfficer: z.string().trim().optional(),
    summary: z.string().max(10000).optional(),
  })
  .strict();

export type CreateFirInput = z.infer<typeof createFirDto>;
export type FirListParams = z.infer<typeof firListParams>;
export type UpdateFirInput = z.infer<typeof updateFirDto>;
