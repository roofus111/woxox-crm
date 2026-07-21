import type { Request, Response } from 'express';
import { sendOk } from '../../../common/response.js';
import { notificationsService } from '../services/notifications.service.js';

export async function getNotificationFeed(req: Request, res: Response) {
  const limit = Number((req.validatedQuery as { limit?: number } | undefined)?.limit)
    || Number(req.query.limit)
    || 30;
  const items = await notificationsService.listFeed(req.workspace!.id, limit);
  return sendOk(res, items);
}

export const listNotificationFeed = getNotificationFeed;
