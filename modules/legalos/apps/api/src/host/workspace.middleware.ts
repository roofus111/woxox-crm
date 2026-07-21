import type { RequestHandler } from 'express';
import mongoose from 'mongoose';
import { ApiError } from '../common/ApiError.js';
import { demoAuthEnabled, env, isProduction } from '../config/env.js';
import type { HostWorkspace } from '../common/types.js';

const DEFAULT_DEMO_WORKSPACE: HostWorkspace = {
  id: '000000000000000000000001',
  name: 'Demo Law Chambers',
  slug: 'demo-law-chambers',
};

function isValidObjectId(value: string): boolean {
  return mongoose.Types.ObjectId.isValid(value);
}

function assertWorkspaceMembership(userWorkspaceIds: string[] | undefined, workspaceId: string): void {
  const mode = env.WORKSPACE_AUTH_MODE;

  if (mode === 'open' && !isProduction) {
    return;
  }

  if (mode === 'header' && !isProduction) {
    return;
  }

  // production default: claim — token must list the workspace
  const allowed = userWorkspaceIds ?? [];
  if (allowed.length === 0) {
    throw ApiError.forbidden('Token missing workspaceIds claim');
  }
  if (!allowed.includes(workspaceId)) {
    throw ApiError.forbidden('Not a member of this workspace');
  }
}

/**
 * Resolves workspace from X-Workspace-Id and enforces JWT membership in production.
 */
export const requireWorkspace: RequestHandler = (req, _res, next) => {
  try {
    const workspaceHeader = req.header('X-Workspace-Id')?.trim();

    if (!workspaceHeader) {
      if (demoAuthEnabled) {
        req.workspace = DEFAULT_DEMO_WORKSPACE;
        return next();
      }
      return next(ApiError.badRequest('X-Workspace-Id header is required'));
    }

    if (workspaceHeader === 'demo' || workspaceHeader === DEFAULT_DEMO_WORKSPACE.slug) {
      if (!demoAuthEnabled && isProduction) {
        return next(ApiError.badRequest('Demo workspace is not available in production'));
      }
      req.workspace = DEFAULT_DEMO_WORKSPACE;
      if (req.user) {
        assertWorkspaceMembership(req.user.workspaceIds, DEFAULT_DEMO_WORKSPACE.id);
      }
      return next();
    }

    if (!isValidObjectId(workspaceHeader)) {
      return next(ApiError.badRequest('Invalid X-Workspace-Id'));
    }

    if (req.user) {
      assertWorkspaceMembership(req.user.workspaceIds, workspaceHeader);
    }

    req.workspace = {
      id: workspaceHeader,
      slug: workspaceHeader,
    };

    next();
  } catch (err) {
    next(err);
  }
};
