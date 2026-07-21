import type { Request, Response } from 'express';
import { ok } from '../../common/response.js';
import { authService } from './auth.service.js';

export async function register(req: Request, res: Response) {
  const data = await authService.register(req.body);
  res.status(201).json(ok(data));
}

export async function login(req: Request, res: Response) {
  const data = await authService.login(req.body);
  res.json(ok(data));
}

export async function me(req: Request, res: Response) {
  res.json(
    ok({
      user: req.user,
      workspace: req.workspace,
    }),
  );
}

export async function crmBridge(req: Request, res: Response) {
  const data = await authService.crmBridge(req.body);
  res.json(ok(data));
}
