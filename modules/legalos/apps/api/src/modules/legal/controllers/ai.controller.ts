import type { Request, Response } from 'express';
import { sendCreated } from '../../../common/response.js';
import { serviceContextFromRequest } from '../../../common/types.js';
import { legalAiService } from '../services/ai/legal-ai.service.js';
import type { AiRequestInput } from '../validators/ai.validator.js';

export async function createAiRequest(req: Request, res: Response) {
  const ctx = serviceContextFromRequest(req);
  const entity = await legalAiService.run(
    ctx,
    req.validatedBody as AiRequestInput,
    req.user!.permissions,
  );
  return sendCreated(res, entity);
}
