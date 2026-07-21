import { ApiError } from '../../../common/ApiError.js';
import {
  buildPaginationMeta,
  buildSort,
  buildTextSearchFilter,
  paginationSkip,
} from '../../../common/pagination.js';
import type { ServiceContext } from '../../../common/types.js';
import { activityService } from '../../../host/activity.service.js';
import { Complaint, type IComplaint } from '../models/complaint.model.js';
import { appendAuditEvent } from '../models/audit-event.model.js';
import type {
  ComplaintListParams,
  CreateComplaintInput,
  ConvertToFirInput,
  UpdateComplaintInput,
} from '../validators/complaints.validator.js';
import { firsService } from './firs.service.js';
import {
  createComplaintEscalatedNotification,
  createComplaintFollowUpNotification,
} from '../models/legal-notification.model.js';
import { outboxService } from '../../../host/outbox.service.js';
import {
  linkedCaseListFilter,
  optionalActorObjectId,
  toObjectId,
  workspaceObjectId,
  type AccessActor,
} from './case-access.util.js';

function normalizePoliceStationKey(policeStation: string): string {
  return policeStation.trim().toLowerCase().replace(/\s+/g, '-');
}

export class ComplaintsService {
  async list(workspaceId: string, params: ComplaintListParams, actor?: AccessActor) {
    const filter: Record<string, unknown> = {
      workspaceId: workspaceObjectId(workspaceId),
      deletedAt: null,
      ...(params.status ? { status: params.status } : {}),
      ...(params.category ? { category: params.category } : {}),
      ...buildTextSearchFilter(params.q, ['complaintNumber', 'policeStation', 'location', 'description']),
    };

    if (actor) {
      const acl = await linkedCaseListFilter(workspaceId, actor, 'linkedCaseId');
      if (acl) Object.assign(filter, acl);
    }

    const skip = paginationSkip(params.page, params.limit);
    const sort = buildSort(params.sort, params.direction, { nextFollowUpAt: 1, createdAt: -1 });

    const [items, total] = await Promise.all([
      Complaint.find(filter).sort(sort).skip(skip).limit(params.limit).lean(),
      Complaint.countDocuments(filter),
    ]);

    return { items, meta: buildPaginationMeta(params.page, params.limit, total) };
  }

  async getById(workspaceId: string, id: string): Promise<IComplaint> {
    const entity = await Complaint.findOne({
      _id: toObjectId(id),
      workspaceId: workspaceObjectId(workspaceId),
      deletedAt: null,
    });

    if (!entity) {
      throw ApiError.notFound('Complaint not found');
    }

    return entity;
  }

  async create(ctx: ServiceContext, input: CreateComplaintInput): Promise<IComplaint> {
    const policeStationKey = input.policeStation
      ? normalizePoliceStationKey(input.policeStation)
      : undefined;

    const entity = await Complaint.create({
      ...input,
      workspaceId: workspaceObjectId(ctx.workspaceId),
      status: input.status ?? 'REGISTERED',
      policeStationKey,
      oppositePartyIds: (input.oppositePartyIds ?? []).map(toObjectId),
      witnessPartyIds: (input.witnessPartyIds ?? []).map(toObjectId),
      clientPartyId: input.clientPartyId ? toObjectId(input.clientPartyId) : undefined,
      linkedCaseId: input.linkedCaseId ? toObjectId(input.linkedCaseId) : undefined,
      createdBy: optionalActorObjectId(ctx.actorId),
      updatedBy: optionalActorObjectId(ctx.actorId),
    });

    await activityService.record({
      workspaceId: ctx.workspaceId,
      actorId: ctx.actorId,
      action: 'legal.complaint.created',
      entityType: 'Complaint',
      entityId: entity.id,
      correlationId: ctx.correlationId,
    });

    return entity;
  }

  async update(
    ctx: ServiceContext,
    id: string,
    input: UpdateComplaintInput,
  ): Promise<IComplaint> {
    const entity = await this.getById(ctx.workspaceId, id);

    if (input.escalation) {
      entity.status = 'ESCALATED';
    } else if (input.status !== undefined) {
      entity.status = input.status;
    }

    if (input.nextFollowUpAt !== undefined) {
      entity.nextFollowUpAt = input.nextFollowUpAt ?? undefined;
    }
    if (input.investigationStatus !== undefined) {
      entity.investigationStatus = input.investigationStatus;
    }
    if (input.notes !== undefined) {
      entity.notes = input.notes;
    }

    entity.updatedBy = optionalActorObjectId(ctx.actorId);
    await entity.save();

    await activityService.record({
      workspaceId: ctx.workspaceId,
      actorId: ctx.actorId,
      action: input.escalation ? 'legal.complaint.escalated' : 'legal.complaint.updated',
      entityType: 'Complaint',
      entityId: entity.id,
      correlationId: ctx.correlationId,
    });

    if (input.escalation) {
      await outboxService.publish('legal.complaint.escalated', {
        workspaceId: ctx.workspaceId,
        complaintId: entity.id,
        complaintNumber: entity.complaintNumber,
      });

      await createComplaintEscalatedNotification({
        workspaceId: ctx.workspaceId,
        complaintId: entity.id,
        complaintNumber: entity.complaintNumber,
        userId: ctx.actorId,
      });
    }

    if (input.nextFollowUpAt) {
      await outboxService.publish('legal.complaint.follow_up_scheduled', {
        workspaceId: ctx.workspaceId,
        complaintId: entity.id,
        nextFollowUpAt: input.nextFollowUpAt.toISOString(),
      });

      await createComplaintFollowUpNotification({
        workspaceId: ctx.workspaceId,
        complaintId: entity.id,
        complaintNumber: entity.complaintNumber,
        nextFollowUpAt: input.nextFollowUpAt,
        userId: ctx.actorId,
      });
    }

    return entity;
  }

  async convertToFir(
    ctx: ServiceContext,
    complaintId: string,
    input: ConvertToFirInput,
  ) {
    const complaint = await this.getById(ctx.workspaceId, complaintId);

    if (complaint.convertedFirId) {
      throw ApiError.conflict('COMPLAINT_ALREADY_CONVERTED', {
        convertedFirId: complaint.convertedFirId.toString(),
      });
    }

    const fir = await firsService.create(ctx, {
      firNumber: input.firNumber,
      policeStation: input.policeStation,
      registeredAt: input.registeredAt,
      actsAndSections: input.actsAndSections,
      accusedPartyIds: input.accusedPartyIds ?? complaint.oppositePartyIds.map(String),
      victimPartyIds: input.victimPartyIds,
      officerPartyId: input.officerPartyId,
      investigationOfficer: input.investigationOfficer,
      linkedCaseId: input.linkedCaseId ?? complaint.linkedCaseId?.toString(),
      sourceComplaintId: complaint.id,
      clientPartyId: complaint.clientPartyId?.toString(),
      summary: input.summary ?? complaint.description,
    });

    complaint.convertedFirId = fir._id;
    complaint.status = 'CONVERTED_TO_FIR';
    complaint.convertedAt = new Date();
    complaint.convertedBy = optionalActorObjectId(ctx.actorId);
    complaint.updatedBy = optionalActorObjectId(ctx.actorId);
    await complaint.save();

    await appendAuditEvent({
      workspaceId: workspaceObjectId(ctx.workspaceId),
      entityType: 'Complaint',
      entityId: complaint._id,
      action: 'CONVERTED_TO_FIR',
      actorId: ctx.actorId,
      correlationId: ctx.correlationId,
      metadata: { firId: fir.id },
    });

    await activityService.record({
      workspaceId: ctx.workspaceId,
      actorId: ctx.actorId,
      action: 'legal.complaint.converted_to_fir',
      entityType: 'Complaint',
      entityId: complaint.id,
      metadata: { firId: fir.id },
      correlationId: ctx.correlationId,
    });

    return { complaint, fir };
  }
}

export const complaintsService = new ComplaintsService();
