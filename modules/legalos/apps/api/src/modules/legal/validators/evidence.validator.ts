import { z } from 'zod';
import { EVIDENCE_MEDIA_TYPES } from '../enums.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId');

export const registerEvidenceDto = z
  .object({
    title: z.string().trim().min(1).max(300),
    description: z.string().max(5000).optional(),
    mediaType: z.enum(EVIDENCE_MEDIA_TYPES),
    mimeType: z.string().trim().min(1),
    sizeBytes: z.coerce.number().int().positive(),
    filename: z.string().trim().min(1).max(255),
    caseId: objectId.optional(),
    complaintId: objectId.optional(),
    firId: objectId.optional(),
    occurredAt: z.coerce.date().optional(),
    tags: z.array(z.string().trim()).optional(),
  })
  .strict()
  .refine((v) => v.caseId || v.complaintId || v.firId, {
    message: 'At least one parent reference (caseId, complaintId, firId) is required',
  });

export const sealEvidenceDto = z
  .object({
    sha256: z
      .string()
      .regex(/^[a-f0-9]{64}$/i, 'sha256 must be a 64-character hex digest')
      .optional(),
    notes: z.string().max(2000).optional(),
  })
  .strict();

export const evidenceIdParams = z.object({ id: objectId }).strict();

export type RegisterEvidenceInput = z.infer<typeof registerEvidenceDto>;
export type SealEvidenceInput = z.infer<typeof sealEvidenceDto>;
