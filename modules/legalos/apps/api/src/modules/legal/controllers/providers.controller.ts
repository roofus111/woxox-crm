import type { Request, Response } from 'express';
import { sendCreated, sendOk } from '../../../common/response.js';
import { serviceContextFromRequest } from '../../../common/types.js';
import type { ProviderId } from '../enums.js';
import { providersService } from '../services/providers.service.js';
import type { SyncRequestInput } from '../validators/providers.validator.js';

export async function getProviderCapabilities(_req: Request, res: Response) {
  return sendOk(res, providersService.getCapabilities());
}

export async function syncProvider(req: Request, res: Response) {
  const ctx = serviceContextFromRequest(req);
  const { provider } = req.validatedParams as { provider: ProviderId };
  const result = await providersService.queueSync(
    ctx,
    provider,
    req.validatedBody as SyncRequestInput,
  );
  return sendCreated(res, result);
}
