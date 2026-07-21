import type { Request, Response } from 'express';
import { sendCreated, sendOk } from '../../../common/response.js';
import { serviceContextFromRequest } from '../../../common/types.js';
import { complaintsService } from '../services/complaints.service.js';
import type {
  ComplaintListParams,
  CreateComplaintInput,
  ConvertToFirInput,
  UpdateComplaintInput,
} from '../validators/complaints.validator.js';

export async function listComplaints(req: Request, res: Response) {
  const params = req.validatedQuery as ComplaintListParams;
  const result = await complaintsService.list(req.workspace!.id, params, {
    id: req.user!.id,
    permissions: req.user!.permissions ?? [],
  });
  return sendOk(res, result.items, 200, result.meta);
}

export async function getComplaint(req: Request, res: Response) {
  const { id } = req.validatedParams as { id: string };
  const entity = await complaintsService.getById(req.workspace!.id, id);
  return sendOk(res, entity);
}

export async function createComplaint(req: Request, res: Response) {
  const ctx = serviceContextFromRequest(req);
  const entity = await complaintsService.create(ctx, req.validatedBody as CreateComplaintInput);
  return sendCreated(res, entity);
}

export async function updateComplaint(req: Request, res: Response) {
  const ctx = serviceContextFromRequest(req);
  const { id } = req.validatedParams as { id: string };
  const entity = await complaintsService.update(ctx, id, req.validatedBody as UpdateComplaintInput);
  return sendOk(res, entity);
}

export async function convertComplaintToFir(req: Request, res: Response) {
  const ctx = serviceContextFromRequest(req);
  const { id } = req.validatedParams as { id: string };
  const result = await complaintsService.convertToFir(
    ctx,
    id,
    req.validatedBody as ConvertToFirInput,
  );
  return sendCreated(res, result);
}
