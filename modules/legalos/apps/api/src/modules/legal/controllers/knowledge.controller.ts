import type { Request, Response } from 'express';
import { sendCreated, sendOk } from '../../../common/response.js';
import { serviceContextFromRequest } from '../../../common/types.js';
import { knowledgeService } from '../services/knowledge.service.js';
import type {
  CreateKnowledgeInput,
  KnowledgeListParams,
  UpdateKnowledgeInput,
} from '../validators/knowledge.validator.js';

export async function listKnowledgeDocs(req: Request, res: Response) {
  const result = await knowledgeService.list(
    req.workspace!.id,
    req.validatedQuery as KnowledgeListParams,
  );
  return sendOk(res, result.items, 200, result.meta);
}

export async function getKnowledgeDoc(req: Request, res: Response) {
  const { id } = req.validatedParams as { id: string };
  return sendOk(res, await knowledgeService.getById(req.workspace!.id, id));
}

export async function createKnowledgeDoc(req: Request, res: Response) {
  const ctx = serviceContextFromRequest(req);
  return sendCreated(
    res,
    await knowledgeService.create(ctx, req.validatedBody as CreateKnowledgeInput),
  );
}

export async function updateKnowledgeDoc(req: Request, res: Response) {
  const ctx = serviceContextFromRequest(req);
  const { id } = req.validatedParams as { id: string };
  return sendOk(
    res,
    await knowledgeService.update(ctx, id, req.validatedBody as UpdateKnowledgeInput),
  );
}

export async function bookmarkKnowledgeDoc(req: Request, res: Response) {
  const ctx = serviceContextFromRequest(req);
  const { id } = req.validatedParams as { id: string };
  return sendOk(res, await knowledgeService.bookmark(ctx, id));
}
