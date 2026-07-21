import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { ApiError } from '../common/ApiError.js';
import { demoAuthEnabled, env, isProduction, resolveJwtSecret } from '../config/env.js';
import type { HostUser } from '../common/types.js';

export const LEGAL_PERMISSIONS = [
  'legal.dashboard.read',
  'legal.case.read',
  'legal.case.create',
  'legal.case.update',
  'legal.case.archive',
  'legal.case.export',
  'legal.complaint.read',
  'legal.complaint.create',
  'legal.complaint.update',
  'legal.complaint.convert_to_fir',
  'legal.fir.read',
  'legal.fir.create',
  'legal.fir.update',
  'legal.evidence.read',
  'legal.evidence.upload',
  'legal.evidence.download',
  'legal.evidence.seal',
  'legal.research.use',
  'legal.ai.use',
  'legal.analytics.read',
  'legal.integration.manage',
  'legal.admin.manage',
  'legal.org.manage',
  'legal.warroom.use',
  'legal.conflict.check',
  'legal.portal.manage',
  'legal.time.record',
  'legal.workflow.approve',
] as const;

function permissionsForRoles(roles: string[]): string[] {
  if (roles.some((r) => ['legal-admin', 'admin', 'workspace-admin'].includes(r))) {
    return [...LEGAL_PERMISSIONS];
  }
  if (roles.some((r) => ['advocate', 'lawyer', 'counsel'].includes(r))) {
    return LEGAL_PERMISSIONS.filter((p) => p !== 'legal.admin.manage' && p !== 'legal.integration.manage');
  }
  return LEGAL_PERMISSIONS.filter((p) => p.endsWith('.read') || p === 'legal.research.use');
}

export { permissionsForRoles };

function parseDemoToken(token: string): HostUser | null {
  if (!demoAuthEnabled) {
    return null;
  }

  if (token === 'demo' || token.startsWith('demo:')) {
    const [, userId = '0000000000000000000000aa'] = token.split(':');
    const id =
      userId.length === 24 && /^[a-fA-F0-9]+$/.test(userId)
        ? userId
        : '0000000000000000000000aa';
    return {
      id,
      email: 'advocate@demo.woxox.local',
      name: 'Demo Advocate',
      roles: ['legal-admin', 'advocate'],
      permissions: [...LEGAL_PERMISSIONS],
      workspaceIds: ['000000000000000000000001'],
    };
  }

  return null;
}

function verifyJwtToken(token: string): HostUser {
  let secret: string;
  try {
    secret = resolveJwtSecret();
  } catch {
    throw ApiError.unauthorized('JWT_SECRET is not configured');
  }

  const verifyOpts: jwt.VerifyOptions = {};
  if (env.JWT_ISSUER) verifyOpts.issuer = env.JWT_ISSUER;
  if (env.JWT_AUDIENCE) verifyOpts.audience = env.JWT_AUDIENCE;

  const payload = jwt.verify(token, secret, verifyOpts) as jwt.JwtPayload & {
    sub?: string;
    id?: string;
    email?: string;
    name?: string;
    roles?: string[];
    permissions?: string[];
    workspaceIds?: string[];
    workspaces?: string[];
  };

  const id = payload.sub ?? payload.id;
  if (!id) {
    throw ApiError.unauthorized('Invalid token subject');
  }

  const roles = payload.roles ?? [];
  const permissions =
    payload.permissions && payload.permissions.length > 0
      ? payload.permissions
      : permissionsForRoles(roles);

  if (isProduction && permissions.length === 0) {
    throw ApiError.forbidden('Token has no LegalOS permissions');
  }

  const workspaceIds = [
    ...(payload.workspaceIds ?? []),
    ...(payload.workspaces ?? []),
  ].map(String);

  return {
    id: String(id),
    email: payload.email,
    name: payload.name,
    roles,
    permissions,
    workspaceIds,
  };
}

/**
 * Resolves Bearer JWT (or demo token in development).
 * Production: HS256 JWT with optional issuer/audience; permissions via claim or role mapping.
 */
export const requireAuth: RequestHandler = (req, _res, next) => {
  req.correlationId = req.header('X-Correlation-Id') ?? uuidv4();

  const header = req.header('Authorization');
  if (!header?.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Missing Bearer token'));
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    return next(ApiError.unauthorized('Empty Bearer token'));
  }

  try {
    const demoUser = parseDemoToken(token);
    req.user = demoUser ?? verifyJwtToken(token);
    next();
  } catch (err) {
    if (err instanceof ApiError) {
      return next(err);
    }
    return next(ApiError.unauthorized('Invalid or expired token'));
  }
};

export const attachUserIfPresent: RequestHandler = (req, _res, next) => {
  const header = req.header('Authorization');
  if (!header?.startsWith('Bearer ')) {
    return next();
  }

  const token = header.slice('Bearer '.length).trim();
  try {
    const demoUser = parseDemoToken(token);
    req.user = demoUser ?? verifyJwtToken(token);
  } catch {
    // optional auth — ignore invalid tokens
  }
  next();
};
