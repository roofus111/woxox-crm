import type { Request, Response } from 'express';
import { sendCreated, sendOk } from '../../../common/response.js';
import { serviceContextFromRequest } from '../../../common/types.js';
import { firsService } from '../services/firs.service.js';
import type { CreateFirInput, FirListParams, UpdateFirInput } from '../validators/firs.validator.js';

export async function listFirs(req: Request, res: Response) {
  const params = req.validatedQuery as FirListParams;
  const result = await firsService.list(req.workspace!.id, params, {
    id: req.user!.id,
    permissions: req.user!.permissions ?? [],
  });
  return sendOk(res, result.items, 200, result.meta);
}

export async function getFir(req: Request, res: Response) {
  const { id } = req.validatedParams as { id: string };
  const entity = await firsService.getById(req.workspace!.id, id);
  return sendOk(res, entity);
}

export async function createFir(req: Request, res: Response) {
  const ctx = serviceContextFromRequest(req);
  const entity = await firsService.create(ctx, req.validatedBody as CreateFirInput);
  return sendCreated(res, entity);
}

export async function updateFir(req: Request, res: Response) {
  const ctx = serviceContextFromRequest(req);
  const { id } = req.validatedParams as { id: string };
  const entity = await firsService.update(ctx, id, req.validatedBody as UpdateFirInput);
  return sendOk(res, entity);
}
