import { z } from 'zod';

import { HearingStatus } from '../enums';
import { courtSnapshotSchema, objectIdSchema } from './cases';

/** Request body for POST /cases/:id/hearings. */
export const createHearingDto = z.object({
  scheduledAt: z.coerce.date(),
  status: z.nativeEnum(HearingStatus).default(HearingStatus.Scheduled),
  court: courtSnapshotSchema.optional(),
  purpose: z.string().trim().min(1).max(500),
  bench: z.string().trim().max(200).optional(),
  itemNumber: z.string().trim().max(50).optional(),
  assignedAdvocateIds: z.array(objectIdSchema).default([]),
  notes: z.string().trim().max(5000).optional(),
  reminderOffsetsMinutes: z
    .array(z.number().int().min(0).max(10_080))
    .max(5)
    .default([1440, 60]),
  isVirtual: z.boolean().default(false),
  virtualLink: z.string().trim().url().max(2000).optional(),
});

export type CreateHearingDto = z.infer<typeof createHearingDto>;
