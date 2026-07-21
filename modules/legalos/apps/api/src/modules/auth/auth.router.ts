import { Router } from 'express';
import { asyncHandler } from '../../common/asyncHandler.js';
import { requireAuth } from '../../host/auth.middleware.js';
import { requireWorkspace } from '../../host/workspace.middleware.js';
import * as authController from './auth.controller.js';

export const authRouter = Router();

authRouter.post('/register', asyncHandler(authController.register));
authRouter.post('/login', asyncHandler(authController.login));
authRouter.post('/crm-bridge', asyncHandler(authController.crmBridge));
authRouter.get('/me', requireAuth, requireWorkspace, asyncHandler(authController.me));
