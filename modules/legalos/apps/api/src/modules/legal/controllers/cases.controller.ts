import type { Request, Response } from 'express';
import { sendCreated, sendOk } from '../../../common/response.js';
import { serviceContextFromRequest } from '../../../common/types.js';
import { casesService } from '../services/cases.service.js';
import type { CaseListParams, CreateCaseInput, UpdateCaseInput } from '../validators/cases.validator.js';

function actorFrom(req: Request) {
  return {
    id: req.user!.id,
    permissions: req.user!.permissions ?? [],
  };
}

export async function listCases(req: Request, res: Response) {
  const params = req.validatedQuery as CaseListParams;
  const result = await casesService.list(req.workspace!.id, params, actorFrom(req));
  return sendOk(res, result.items, 200, result.meta);
}

export async function createCase(req: Request, res: Response) {
  const ctx = serviceContextFromRequest(req);
  const entity = await casesService.create(ctx, req.validatedBody as CreateCaseInput);
  return sendCreated(res, entity);
}

export async function getCase(req: Request, res: Response) {
  const { id } = req.validatedParams as { id: string };
  const entity = await casesService.getById(req.workspace!.id, id, actorFrom(req));
  return sendOk(res, entity);
}

export async function updateCase(req: Request, res: Response) {
  const ctx = serviceContextFromRequest(req);
  const { id } = req.validatedParams as { id: string };
  const entity = await casesService.update(
    ctx,
    id,
    req.validatedBody as UpdateCaseInput,
    req.user!.permissions ?? [],
  );
  return sendOk(res, entity);
}
