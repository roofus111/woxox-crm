import { z } from 'zod';
import { PARTY_TYPES } from '../enums.js';
import { paginationQuerySchema } from '../../../common/pagination.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId');

export const createPartyDto = z
  .object({
    type: z.enum(PARTY_TYPES),
    displayName: z.string().trim().min(1).max(300),
    firstName: z.string().trim().optional(),
    lastName: z.string().trim().optional(),
    organizationName: z.string().trim().optional(),
    designation: z.string().trim().optional(),
    contact: z
      .object({
        phone: z.string().trim().optional(),
        email: z.string().email().optional(),
        address: z.string().trim().optional(),
        city: z.string().trim().optional(),
        state: z.string().trim().optional(),
        pincode: z.string().trim().optional(),
      })
      .strict()
      .optional(),
    identityDocuments: z
      .array(
        z.object({
          type: z.string().trim().min(1),
          number: z.string().trim().min(1),
          issuedAt: z.coerce.date().optional(),
          expiresAt: z.coerce.date().optional(),
        }),
      )
      .optional(),
    notes: z.string().max(5000).optional(),
    tags: z.array(z.string().trim()).optional(),
  })
  .strict();

export const updatePartyDto = createPartyDto.partial().strict();

export const partyListParams = paginationQuerySchema.extend({
  type: z.enum(PARTY_TYPES).optional(),
});

export const partyIdParams = z.object({ id: objectId }).strict();

export type CreatePartyInput = z.infer<typeof createPartyDto>;
export type UpdatePartyInput = z.infer<typeof updatePartyDto>;
export type PartyListParams = z.infer<typeof partyListParams>;
