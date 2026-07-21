import type { Request } from 'express';

export interface HostUser {
  id: string;
  email?: string;
  name?: string;
  roles: string[];
  permissions: string[];
  /** Workspace ObjectIds the token is allowed to access */
  workspaceIds?: string[];
}

export interface HostWorkspace {
  id: string;
  name?: string;
  slug?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: HostUser;
      workspace?: HostWorkspace;
      correlationId?: string;
      validatedBody?: unknown;
      validatedQuery?: unknown;
      validatedParams?: unknown;
    }
  }
}

export interface ServiceContext {
  workspaceId: string;
  actorId: string;
  correlationId?: string;
}

export function serviceContextFromRequest(req: Request): ServiceContext {
  if (!req.workspace?.id || !req.user?.id) {
    throw new Error('Request missing workspace or user context');
  }

  return {
    workspaceId: req.workspace.id,
    actorId: req.user.id,
    correlationId: req.correlationId,
  };
}
