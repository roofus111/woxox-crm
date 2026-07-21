import { z } from 'zod';
import { COMPLAINT_CATEGORIES, COMPLAINT_STATUSES } from '../enums.js';
import { paginationQuerySchema } from '../../../common/pagination.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId');

export const createComplaintDto = z
  .object({
    complaintNumber: z.string().trim().min(1).max(50),
    category: z.enum(COMPLAINT_CATEGORIES),
    status: z.enum(COMPLAINT_STATUSES).optional(),
    policeStation: z.string().trim().optional(),
    clientPartyId: objectId.optional(),
    oppositePartyIds: z.array(objectId).optional(),
    witnessPartyIds: z.array(objectId).optional(),
    incidentDate: z.coerce.date().optional(),
    location: z.string().trim().max(500).optional(),
    description: z.string().max(10000).optional(),
    investigationStatus: z.string().trim().optional(),
    nextFollowUpAt: z.coerce.date().optional(),
    linkedCaseId: objectId.optional(),
    notes: z.string().max(10000).optional(),
    tags: z.array(z.string().trim()).optional(),
  })
  .strict();

export const convertToFirDto = z
  .object({
    firNumber: z.string().trim().min(1).max(50),
    policeStation: z.string().trim().min(1).max(200),
    registeredAt: z.coerce.date().optional(),
    actsAndSections: z
      .array(
        z.object({
          act: z.string().trim().min(1),
          sections: z.array(z.string().trim()).default([]),
        }),
      )
      .optional(),
    accusedPartyIds: z.array(objectId).optional(),
    victimPartyIds: z.array(objectId).optional(),
    officerPartyId: objectId.optional(),
    investigationOfficer: z.string().trim().optional(),
    linkedCaseId: objectId.optional(),
    summary: z.string().max(10000).optional(),
  })
  .strict();

export const complaintListParams = paginationQuerySchema.extend({
  status: z.enum(COMPLAINT_STATUSES).optional(),
  category: z.enum(COMPLAINT_CATEGORIES).optional(),
});

export const complaintIdParams = z.object({ id: objectId }).strict();

export const updateComplaintDto = z
  .object({
    status: z.enum(COMPLAINT_STATUSES).optional(),
    nextFollowUpAt: z.coerce.date().nullable().optional(),
    investigationStatus: z.string().trim().optional(),
    notes: z.string().max(10000).optional(),
    escalation: z.boolean().optional(),
  })
  .strict();

export type CreateComplaintInput = z.infer<typeof createComplaintDto>;
export type ConvertToFirInput = z.infer<typeof convertToFirDto>;
export type ComplaintListParams = z.infer<typeof complaintListParams>;
export type UpdateComplaintInput = z.infer<typeof updateComplaintDto>;
