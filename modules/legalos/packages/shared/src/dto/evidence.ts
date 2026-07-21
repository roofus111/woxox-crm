import { z } from 'zod';

import { EvidenceMediaType } from '../enums';
import { objectIdSchema } from './cases';

const evidenceParentTypeSchema = z.enum(['case', 'complaint', 'fir']);

/** Request body for POST /evidence/upload-intents (metadata registration). */
export const registerEvidenceDto = z
  .object({
    parentType: evidenceParentTypeSchema,
    parentId: objectIdSchema,
    title: z.string().trim().min(1).max(300),
    description: z.string().trim().max(5000).optional(),
    mediaType: z.nativeEnum(EvidenceMediaType),
    mimeType: z.string().trim().min(3).max(255),
    sizeBytes: z.number().int().positive().max(104_857_600),
    originalFileName: z.string().trim().min(1).max(500),
    occurredAt: z.coerce.date().optional(),
    receivedAt: z.coerce.date().optional(),
    source: z.string().trim().max(500).optional(),
    tags: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
    checksumSha256: z
      .string()
      .trim()
      .regex(/^[a-f0-9]{64}$/i, 'Invalid SHA-256 checksum')
      .optional(),
  })
  .superRefine((value, ctx) => {
    if (value.receivedAt && value.occurredAt && value.receivedAt < value.occurredAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'receivedAt cannot be earlier than occurredAt',
        path: ['receivedAt'],
      });
    }
  });

export type RegisterEvidenceDto = z.infer<typeof registerEvidenceDto>;

/** Request body for POST /evidence/:id/seal. */
export const sealEvidenceDto = z.object({
  reason: z.string().trim().min(1).max(2000),
  sealedAt: z.coerce.date().optional(),
  legalHold: z.boolean().default(true),
  notes: z.string().trim().max(5000).optional(),
});

export type SealEvidenceDto = z.infer<typeof sealEvidenceDto>;
