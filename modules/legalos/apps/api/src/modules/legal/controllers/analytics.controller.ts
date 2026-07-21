import type { Request, Response } from 'express';
import { sendOk } from '../../../common/response.js';
import { analyticsService } from '../services/analytics.service.js';

export async function getPortfolioAnalytics(req: Request, res: Response) {
  const data = await analyticsService.getPortfolio(req.workspace!.id, {
    id: req.user!.id,
    permissions: req.user!.permissions ?? [],
  });
  return sendOk(res, data);
}
