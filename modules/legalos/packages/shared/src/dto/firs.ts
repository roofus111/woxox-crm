import { z } from 'zod';

import { BailStatus, FirStatus } from '../enums';
import { objectIdSchema } from './cases';

/** Request body for POST /firs. */
export const createFirDto = z.object({
  firNumber: z.string().trim().min(1).max(100),
  policeStationKey: z.string().trim().min(1).max(200),
  policeStationName: z.string().trim().max(200).optional(),
  status: z.nativeEnum(FirStatus).default(FirStatus.Registered),
  bailStatus: z.nativeEnum(BailStatus).default(BailStatus.NotApplicable),
  clientPartyId: objectIdSchema,
  officerPartyId: objectIdSchema.optional(),
  oppositePartyIds: z.array(objectIdSchema).default([]),
  linkedCaseId: objectIdSchema.optional(),
  sourceComplaintId: objectIdSchema.optional(),
  registeredAt: z.coerce.date(),
  sections: z.array(z.string().trim().min(1).max(100)).min(1),
  ipcSections: z.array(z.string().trim().min(1).max(50)).default([]),
  bnsSections: z.array(z.string().trim().min(1).max(50)).default([]),
  narrative: z.string().trim().max(10000).optional(),
  incidentDate: z.coerce.date().optional(),
  incidentLocation: z.string().trim().max(500).optional(),
});

export type CreateFirDto = z.infer<typeof createFirDto>;

/** Query parameters for GET /firs. */
export const firListParams = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(200).optional(),
  sort: z
    .enum(['createdAt', 'updatedAt', 'registeredAt', 'firNumber', 'status', 'bailStatus'])
    .default('registeredAt'),
  direction: z.enum(['asc', 'desc']).default('desc'),
  status: z.nativeEnum(FirStatus).optional(),
  bailStatus: z.nativeEnum(BailStatus).optional(),
  clientPartyId: objectIdSchema.optional(),
  policeStationKey: z.string().trim().max(200).optional(),
  linkedCaseId: objectIdSchema.optional(),
  sourceComplaintId: objectIdSchema.optional(),
});

export type FirListParams = z.infer<typeof firListParams>;
