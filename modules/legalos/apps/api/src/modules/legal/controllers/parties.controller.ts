import type { Request, Response } from 'express';
import { sendCreated, sendOk } from '../../../common/response.js';
import { serviceContextFromRequest } from '../../../common/types.js';
import { partiesService } from '../services/parties.service.js';
import type {
  CreatePartyInput,
  PartyListParams,
  UpdatePartyInput,
} from '../validators/parties.validator.js';

export async function listParties(req: Request, res: Response) {
  const params = req.validatedQuery as PartyListParams;
  const result = await partiesService.list(req.workspace!.id, params);
  return sendOk(res, result.items, 200, result.meta);
}

export async function createParty(req: Request, res: Response) {
  const ctx = serviceContextFromRequest(req);
  const entity = await partiesService.create(ctx, req.validatedBody as CreatePartyInput);
  return sendCreated(res, entity);
}

export async function getParty(req: Request, res: Response) {
  const { id } = req.validatedParams as { id: string };
  const entity = await partiesService.getById(req.workspace!.id, id);
  return sendOk(res, entity);
}

export async function updateParty(req: Request, res: Response) {
  const ctx = serviceContextFromRequest(req);
  const { id } = req.validatedParams as { id: string };
  const entity = await partiesService.update(ctx, id, req.validatedBody as UpdatePartyInput);
  return sendOk(res, entity);
}

export async function deleteParty(req: Request, res: Response) {
  const ctx = serviceContextFromRequest(req);
  const { id } = req.validatedParams as { id: string };
  const entity = await partiesService.softDelete(ctx, id);
  return sendOk(res, entity);
}
