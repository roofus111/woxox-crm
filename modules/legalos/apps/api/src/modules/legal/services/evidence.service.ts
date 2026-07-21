import { v4 as uuidv4 } from 'uuid';
import { ApiError } from '../../../common/ApiError.js';
import type { ServiceContext } from '../../../common/types.js';
import { env } from '../../../config/env.js';
import { activityService } from '../../../host/activity.service.js';
import { objectStorageService } from '../../../host/object-storage.service.js';
import { outboxService } from '../../../host/outbox.service.js';
import { appendAuditEvent } from '../models/audit-event.model.js';
import { Complaint } from '../models/complaint.model.js';
import { Evidence, type IEvidence } from '../models/evidence.model.js';
import { Fir } from '../models/fir.model.js';
import { LegalCase } from '../models/legal-case.model.js';
import type { RegisterEvidenceInput, SealEvidenceInput } from '../validators/evidence.validator.js';

import {
  optionalActorObjectId,
  resolveVisibleCaseIds,
  toObjectId,
  workspaceObjectId,
  type AccessActor,
} from './case-access.util.js';

async function assertParentExists(
  workspaceId: string,
  input: Pick<RegisterEvidenceInput, 'caseId' | 'complaintId' | 'firId'>,
): Promise<void> {
  if (input.caseId) {
    const exists = await LegalCase.exists({
      _id: toObjectId(input.caseId),
      workspaceId: workspaceObjectId(workspaceId),
      deletedAt: null,
    });
    if (!exists) throw ApiError.notFound('Linked case not found');
  }

  if (input.complaintId) {
    const exists = await Complaint.exists({
      _id: toObjectId(input.complaintId),
      workspaceId: workspaceObjectId(workspaceId),
      deletedAt: null,
    });
    if (!exists) throw ApiError.notFound('Linked complaint not found');
  }

  if (input.firId) {
    const exists = await Fir.exists({
      _id: toObjectId(input.firId),
      workspaceId: workspaceObjectId(workspaceId),
      deletedAt: null,
    });
    if (!exists) throw ApiError.notFound('Linked FIR not found');
  }
}

export class EvidenceService {
  async registerUploadIntent(ctx: ServiceContext, input: RegisterEvidenceInput) {
    await assertParentExists(ctx.workspaceId, input);

    const upload = await objectStorageService.createPrivateUploadIntent({
      workspaceId: ctx.workspaceId,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      filename: input.filename,
      purpose: 'legal-evidence',
    });

    const custodyEvent = {
      eventId: uuidv4(),
      action: 'REGISTERED' as const,
      actorId: ctx.actorId,
      occurredAt: new Date(),
      storageKey: upload.key,
      notes: 'Upload intent created',
    };

    const evidence = await Evidence.create({
      workspaceId: workspaceObjectId(ctx.workspaceId),
      title: input.title,
      description: input.description,
      mediaType: input.mediaType,
      status: 'PENDING_UPLOAD',
      caseId: input.caseId ? toObjectId(input.caseId) : undefined,
      complaintId: input.complaintId ? toObjectId(input.complaintId) : undefined,
      firId: input.firId ? toObjectId(input.firId) : undefined,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      storageKey: upload.key,
      hashAlgorithm: env.LEGALOS_EVIDENCE_HASH_ALGORITHM,
      occurredAt: input.occurredAt,
      receivedAt: new Date(),
      tags: input.tags,
      custodyEvents: [custodyEvent],
      createdBy: optionalActorObjectId(ctx.actorId),
      updatedBy: optionalActorObjectId(ctx.actorId),
    });

    await activityService.record({
      workspaceId: ctx.workspaceId,
      actorId: ctx.actorId,
      action: 'legal.evidence.upload_intent_created',
      entityType: 'Evidence',
      entityId: evidence.id,
      correlationId: ctx.correlationId,
    });

    await outboxService.publish('legal.evidence.upload_intent_created', {
      workspaceId: ctx.workspaceId,
      evidenceId: evidence.id,
      storageKey: upload.key,
    });

    return { evidence, upload };
  }

  async seal(ctx: ServiceContext, evidenceId: string, input: SealEvidenceInput): Promise<IEvidence> {
    const evidence = await Evidence.findOne({
      _id: toObjectId(evidenceId),
      workspaceId: workspaceObjectId(ctx.workspaceId),
      deletedAt: null,
    });

    if (!evidence) {
      throw ApiError.notFound('Evidence not found');
    }

    if (evidence.status === 'SEALED') {
      throw ApiError.conflict('Evidence is already sealed');
    }

    if (input.sha256) {
      evidence.sha256 = input.sha256.toLowerCase();
    }

    evidence.status = 'SEALED';
    evidence.sealedAt = new Date();
    evidence.sealedBy = optionalActorObjectId(ctx.actorId);
    evidence.custodyEvents.push({
      eventId: uuidv4(),
      action: 'SEALED',
      actorId: ctx.actorId,
      occurredAt: new Date(),
      sha256: evidence.sha256,
      storageKey: evidence.storageKey,
      notes: input.notes,
    });
    evidence.updatedBy = optionalActorObjectId(ctx.actorId);
    await evidence.save();

    await appendAuditEvent({
      workspaceId: workspaceObjectId(ctx.workspaceId),
      entityType: 'Evidence',
      entityId: evidence._id,
      action: 'SEALED',
      actorId: ctx.actorId,
      correlationId: ctx.correlationId,
      metadata: { sha256: evidence.sha256 },
    });

    await activityService.record({
      workspaceId: ctx.workspaceId,
      actorId: ctx.actorId,
      action: 'legal.evidence.sealed',
      entityType: 'Evidence',
      entityId: evidence.id,
      correlationId: ctx.correlationId,
    });

    return evidence;
  }

  async list(
    workspaceId: string,
    params: { caseId?: string; complaintId?: string; firId?: string; limit?: number },
    actor?: AccessActor,
  ) {
    const filter: Record<string, unknown> = {
      workspaceId: workspaceObjectId(workspaceId),
      deletedAt: null,
    };
    if (params.caseId) filter.caseId = toObjectId(params.caseId);
    if (params.complaintId) filter.complaintId = toObjectId(params.complaintId);
    if (params.firId) filter.firId = toObjectId(params.firId);

    if (actor && !params.caseId) {
      const visible = await resolveVisibleCaseIds(workspaceId, actor);
      if (visible !== 'ALL') {
        const actorOid = optionalActorObjectId(actor.id);
        const or: Record<string, unknown>[] = [{ caseId: { $in: visible } }];
        if (actorOid) {
          or.push({
            $and: [
              { $or: [{ caseId: null }, { caseId: { $exists: false } }] },
              { createdBy: actorOid },
            ],
          });
        }
        filter.$or = or;
      }
    } else if (actor && params.caseId) {
      const { enterpriseService } = await import('./enterprise.service.js');
      await enterpriseService.assertCaseAccess(
        workspaceId,
        params.caseId,
        actor.id,
        actor.permissions,
        'VIEW',
      );
    }

    return Evidence.find(filter)
      .sort({ createdAt: -1 })
      .limit(Math.min(100, params.limit ?? 50))
      .lean();
  }

  async getById(workspaceId: string, id: string): Promise<IEvidence> {
    const entity = await Evidence.findOne({
      _id: toObjectId(id),
      workspaceId: workspaceObjectId(workspaceId),
      deletedAt: null,
    });

    if (!entity) {
      throw ApiError.notFound('Evidence not found');
    }

    return entity;
  }
}

export const evidenceService = new EvidenceService();
