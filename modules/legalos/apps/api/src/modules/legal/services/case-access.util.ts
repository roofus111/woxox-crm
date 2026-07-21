import mongoose from 'mongoose';
import { FirmMember } from '../models/firm-member.model.js';
import { LegalCase } from '../models/legal-case.model.js';
import { enterpriseService } from './enterprise.service.js';

export type AccessActor = { id: string; permissions: string[] };

export function workspaceObjectId(workspaceId: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(workspaceId);
}

export function toObjectId(id: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(id);
}

/** Only convert when the string is a real 24-hex ObjectId (avoids casting host UUIDs / "demo"). */
export function toActorObjectId(actorId: string): mongoose.Types.ObjectId | undefined {
  if (!actorId || !/^[a-fA-F0-9]{24}$/.test(actorId)) return undefined;
  try {
    const oid = new mongoose.Types.ObjectId(actorId);
    return oid.toString() === actorId ? oid : undefined;
  } catch {
    return undefined;
  }
}

export function optionalActorObjectId(actorId: string): mongoose.Types.ObjectId | undefined {
  return toActorObjectId(actorId);
}

/**
 * Mongo filter fragment for LegalCase documents the actor may see.
 * Returns null when the actor is firm-admin (no extra ACL clause).
 */
export async function caseVisibilityFilter(
  workspaceId: string,
  actor: AccessActor,
): Promise<Record<string, unknown> | null> {
  const accessible = await enterpriseService.accessibleCaseIds(
    workspaceId,
    actor.id,
    actor.permissions,
  );
  if (accessible === 'ALL') return null;

  const member = await FirmMember.findOne({
    workspaceId: workspaceObjectId(workspaceId),
    userId: actor.id,
    active: true,
  })
    .select('branchId')
    .lean();

  const or: Record<string, unknown>[] = [{ visibility: 'FIRM' }];

  if (member?.branchId) {
    or.push({ visibility: 'BRANCH', branchId: member.branchId });
  }

  if (accessible.length > 0) {
    or.push({ _id: { $in: accessible.map(toObjectId) } });
  }

  const actorOid = toActorObjectId(actor.id);
  if (actorOid) {
    or.push({ createdBy: actorOid });
  }

  return { $or: or };
}

/** Resolve case ObjectIds visible to the actor (empty array if none; null if ALL). */
export async function resolveVisibleCaseIds(
  workspaceId: string,
  actor: AccessActor,
): Promise<mongoose.Types.ObjectId[] | 'ALL'> {
  const vis = await caseVisibilityFilter(workspaceId, actor);
  if (vis === null) return 'ALL';

  const rows = await LegalCase.find({
    workspaceId: workspaceObjectId(workspaceId),
    deletedAt: null,
    ...vis,
  })
    .select('_id')
    .lean();

  return rows.map((r) => r._id as mongoose.Types.ObjectId);
}

/**
 * Filter for entities optionally linked to a case (complaints/FIRs).
 * Unlinked rows are only visible to their creator (when actor id is ObjectId).
 */
export async function linkedCaseListFilter(
  workspaceId: string,
  actor: AccessActor,
  linkedField: 'linkedCaseId' | 'caseId',
): Promise<Record<string, unknown> | null> {
  const visible = await resolveVisibleCaseIds(workspaceId, actor);
  if (visible === 'ALL') return null;

  const actorOid = toActorObjectId(actor.id);
  const or: Record<string, unknown>[] = [{ [linkedField]: { $in: visible } }];

  if (actorOid) {
    or.push({
      $and: [
        {
          $or: [{ [linkedField]: null }, { [linkedField]: { $exists: false } }],
        },
        { createdBy: actorOid },
      ],
    });
  }

  return { $or: or };
}
