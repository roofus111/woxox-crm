import { z } from 'zod';
import { KNOWLEDGE_CATEGORIES } from '../models/knowledge.model.js';
import { paginationQuerySchema } from '../../../common/pagination.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId');

export const createKnowledgeDocDto = z
  .object({
    title: z.string().trim().min(1).max(300),
    category: z.enum(KNOWLEDGE_CATEGORIES),
    body: z.string().min(1).max(200000),
    tags: z.array(z.string().trim()).optional(),
  })
  .strict();

export const updateKnowledgeDocDto = createKnowledgeDocDto.partial().strict();

export const knowledgeListParams = paginationQuerySchema.extend({
  category: z.enum(KNOWLEDGE_CATEGORIES).optional(),
});

export const knowledgeIdParams = z.object({ id: objectId }).strict();

export const notificationFeedParams = z
  .object({
    limit: z.coerce.number().int().positive().max(100).optional(),
  })
  .strict();

export type CreateKnowledgeInput = z.infer<typeof createKnowledgeDocDto>;
export type UpdateKnowledgeInput = z.infer<typeof updateKnowledgeDocDto>;
export type KnowledgeListParams = z.infer<typeof knowledgeListParams>;

// aliases for older imports
export const createKnowledgeDto = createKnowledgeDocDto;
export const updateKnowledgeDto = updateKnowledgeDocDto;
