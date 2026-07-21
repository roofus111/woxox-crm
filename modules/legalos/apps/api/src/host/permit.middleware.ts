import type { RequestHandler } from 'express';
import { ApiError } from '../common/ApiError.js';

export type LegalPermission =
  | 'legal.case.read'
  | 'legal.case.create'
  | 'legal.case.update'
  | 'legal.case.archive'
  | 'legal.case.export'
  | 'legal.complaint.read'
  | 'legal.complaint.create'
  | 'legal.complaint.update'
  | 'legal.complaint.convert_to_fir'
  | 'legal.fir.read'
  | 'legal.fir.create'
  | 'legal.fir.update'
  | 'legal.evidence.read'
  | 'legal.evidence.upload'
  | 'legal.evidence.download'
  | 'legal.evidence.seal'
  | 'legal.research.use'
  | 'legal.ai.use'
  | 'legal.analytics.read'
  | 'legal.integration.manage'
  | 'legal.admin.manage'
  | 'legal.dashboard.read'
  | 'legal.org.manage'
  | 'legal.warroom.use'
  | 'legal.conflict.check'
  | 'legal.portal.manage'
  | 'legal.time.record'
  | 'legal.workflow.approve';

function hasPermission(userPermissions: string[], required: LegalPermission): boolean {
  if (userPermissions.includes('legal.admin.manage')) {
    return true;
  }
  return userPermissions.includes(required);
}

/**
 * Host integration stub — maps to WOXOX RBAC permit decorator/middleware.
 */
export function permit(...permissions: LegalPermission[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }

    const granted = permissions.some((p) => hasPermission(req.user!.permissions, p));
    if (!granted) {
      return next(ApiError.forbidden(`Missing permission: ${permissions.join(' or ')}`));
    }

    next();
  };
}

export function permitAny(permissions: LegalPermission[]): RequestHandler {
  return permit(...permissions);
}

export function permitAll(...permissions: LegalPermission[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }

    const missing = permissions.filter((p) => !hasPermission(req.user!.permissions, p));
    if (missing.length > 0) {
      return next(ApiError.forbidden(`Missing permissions: ${missing.join(', ')}`));
    }

    next();
  };
}
