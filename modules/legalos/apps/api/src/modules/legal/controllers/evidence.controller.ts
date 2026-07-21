import type { Request, Response } from 'express';
import { sendCreated, sendOk } from '../../../common/response.js';
import { serviceContextFromRequest } from '../../../common/types.js';
import { evidenceService } from '../services/evidence.service.js';
import type { RegisterEvidenceInput, SealEvidenceInput } from '../validators/evidence.validator.js';

export async function createEvidenceUploadIntent(req: Request, res: Response) {
  const ctx = serviceContextFromRequest(req);
  const result = await evidenceService.registerUploadIntent(
    ctx,
    req.validatedBody as RegisterEvidenceInput,
  );
  return sendCreated(res, result);
}

export async function listEvidence(req: Request, res: Response) {
  const query = req.query as {
    caseId?: string;
    complaintId?: string;
    firId?: string;
    limit?: string;
  };
  const items = await evidenceService.list(
    req.workspace!.id,
    {
      caseId: query.caseId,
      complaintId: query.complaintId,
      firId: query.firId,
      limit: query.limit ? Number(query.limit) : undefined,
    },
    {
      id: req.user!.id,
      permissions: req.user!.permissions ?? [],
    },
  );
  return sendOk(res, items);
}

export async function getEvidence(req: Request, res: Response) {
  const { id } = req.validatedParams as { id: string };
  const entity = await evidenceService.getById(req.workspace!.id, id);
  return sendOk(res, entity);
}

export async function sealEvidence(req: Request, res: Response) {
  const ctx = serviceContextFromRequest(req);
  const { id } = req.validatedParams as { id: string };
  const entity = await evidenceService.seal(ctx, id, req.validatedBody as SealEvidenceInput);
  return sendOk(res, entity);
}
