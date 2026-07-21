import type { Request, Response } from 'express';
import { sendCreated, sendOk } from '../../../common/response.js';
import { serviceContextFromRequest } from '../../../common/types.js';
import { hearingsService } from '../services/hearings.service.js';
import type {
  CreateHearingInput,
  HearingListParams,
} from '../validators/hearings.validator.js';

export async function listHearings(req: Request, res: Response) {
  const params = req.validatedQuery as HearingListParams;
  const result = await hearingsService.listHearings(req.workspace!.id, params, {
    id: req.user!.id,
    permissions: req.user!.permissions ?? [],
  });
  return sendOk(res, result.items, 200, result.meta);
}

export async function createCaseHearing(req: Request, res: Response) {
  const ctx = serviceContextFromRequest(req);
  const { id } = req.validatedParams as { id: string };
  const entity = await hearingsService.createForCase(
    ctx,
    id,
    req.validatedBody as CreateHearingInput,
  );
  return sendCreated(res, entity);
}
