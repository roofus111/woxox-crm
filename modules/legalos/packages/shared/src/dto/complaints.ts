import { z } from 'zod';

import { ComplaintCategory, ComplaintStatus } from '../enums';
import { objectIdSchema } from './cases';

/** Request body for POST /complaints. */
export const createComplaintDto = z.object({
  complaintNumber: z.string().trim().max(100).optional(),
  title: z.string().trim().min(1).max(300),
  category: z.nativeEnum(ComplaintCategory),
  status: z.nativeEnum(ComplaintStatus).default(ComplaintStatus.Registered),
  clientPartyId: objectIdSchema,
  oppositePartyIds: z.array(objectIdSchema).default([]),
  policeStationId: objectIdSchema.optional(),
  policeStationName: z.string().trim().max(200).optional(),
  incidentDate: z.coerce.date().optional(),
  incidentLocation: z.string().trim().max(500).optional(),
  description: z.string().trim().min(1).max(10000),
  sectionsInvoked: z.array(z.string().trim().min(1).max(100)).default([]),
  nextFollowUpAt: z.coerce.date().optional(),
  linkedCaseId: objectIdSchema.optional(),
  witnessPartyIds: z.array(objectIdSchema).default([]),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
});

export type CreateComplaintDto = z.infer<typeof createComplaintDto>;

/** Request body for POST /complaints/:id/convert-to-fir. */
export const convertToFirDto = z.object({
  firNumber: z.string().trim().min(1).max(100),
  policeStationKey: z.string().trim().min(1).max(200),
  policeStationName: z.string().trim().max(200).optional(),
  registeredAt: z.coerce.date(),
  sections: z.array(z.string().trim().min(1).max(100)).min(1),
  officerPartyId: objectIdSchema.optional(),
  linkedCaseId: objectIdSchema.optional(),
  narrative: z.string().trim().max(10000).optional(),
  ipcSections: z.array(z.string().trim().min(1).max(50)).default([]),
  bnsSections: z.array(z.string().trim().min(1).max(50)).default([]),
});

export type ConvertToFirDto = z.infer<typeof convertToFirDto>;

/** Query parameters for GET /complaints. */
export const complaintListParams = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(200).optional(),
  sort: z
    .enum(['createdAt', 'updatedAt', 'nextFollowUpAt', 'complaintNumber', 'status', 'category'])
    .default('nextFollowUpAt'),
  direction: z.enum(['asc', 'desc']).default('asc'),
  status: z.nativeEnum(ComplaintStatus).optional(),
  category: z.nativeEnum(ComplaintCategory).optional(),
  clientPartyId: objectIdSchema.optional(),
  converted: z.coerce.boolean().optional(),
  followUpFrom: z.coerce.date().optional(),
  followUpTo: z.coerce.date().optional(),
});

export type ComplaintListParams = z.infer<typeof complaintListParams>;
