import { z } from 'zod';
import { PROVIDER_IDS } from '../enums.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId');

export const syncRequestDto = z
  .object({
    entityType: z.enum(['case', 'complaint', 'fir']),
    entityId: objectId,
    externalKey: z.string().trim().min(1).optional(),
    force: z.boolean().default(false),
  })
  .strict();

export const providerParams = z
  .object({
    provider: z.enum(PROVIDER_IDS),
  })
  .strict();

export type SyncRequestInput = z.infer<typeof syncRequestDto>;
