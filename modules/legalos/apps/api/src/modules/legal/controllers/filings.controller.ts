import type { Request, Response } from 'express';
import { sendCreated, sendOk } from '../../../common/response.js';
import { serviceContextFromRequest } from '../../../common/types.js';
import { filingsService } from '../services/filings.service.js';
import type {
  CreateFilingInput,
  FilingListParams,
  UpdateFilingInput,
} from '../validators/filings.validator.js';

export async function listFilings(req: Request, res: Response) {
  const result = await filingsService.list(
    req.workspace!.id,
    req.validatedQuery as FilingListParams,
  );
  return sendOk(res, result.items, 200, result.meta);
}

export async function getFiling(req: Request, res: Response) {
  const { id } = req.validatedParams as { id: string };
  return sendOk(res, await filingsService.getById(req.workspace!.id, id));
}

export async function createFiling(req: Request, res: Response) {
  const ctx = serviceContextFromRequest(req);
  const entity = await filingsService.create(ctx, req.validatedBody as CreateFilingInput);
  return sendCreated(res, entity);
}

export async function updateFiling(req: Request, res: Response) {
  const ctx = serviceContextFromRequest(req);
  const { id } = req.validatedParams as { id: string };
  const entity = await filingsService.update(ctx, id, req.validatedBody as UpdateFilingInput);
  return sendOk(res, entity);
}
