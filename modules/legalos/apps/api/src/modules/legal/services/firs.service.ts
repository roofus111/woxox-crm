import { ApiError } from '../../../common/ApiError.js';
import {
  buildPaginationMeta,
  buildSort,
  buildTextSearchFilter,
  paginationSkip,
} from '../../../common/pagination.js';
import type { ServiceContext } from '../../../common/types.js';
import { activityService } from '../../../host/activity.service.js';
import { Fir, type IFir } from '../models/fir.model.js';
import type { CreateFirInput, FirListParams, UpdateFirInput } from '../validators/firs.validator.js';
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

export class FirsService {
  async list(workspaceId: string, params: FirListParams, actor?: AccessActor) {
    const filter: Record<string, unknown> = {
      workspaceId: workspaceObjectId(workspaceId),
      deletedAt: null,
      ...(params.status ? { status: params.status } : {}),
      ...(params.bailStatus ? { bailStatus: params.bailStatus } : {}),
      ...(params.policeStationKey ? { policeStationKey: params.policeStationKey } : {}),
      ...buildTextSearchFilter(params.q, ['firNumber', 'policeStation', 'summary']),
    };

    if (actor) {
      const acl = await linkedCaseListFilter(workspaceId, actor, 'linkedCaseId');
      if (acl) Object.assign(filter, acl);
    }

    const skip = paginationSkip(params.page, params.limit);
    const sort = buildSort(params.sort, params.direction, { registeredAt: -1, createdAt: -1 });

    const [items, total] = await Promise.all([
      Fir.find(filter).sort(sort).skip(skip).limit(params.limit).lean(),
      Fir.countDocuments(filter),
    ]);

    return { items, meta: buildPaginationMeta(params.page, params.limit, total) };
  }

  async getById(workspaceId: string, id: string): Promise<IFir> {
    const entity = await Fir.findOne({
      _id: toObjectId(id),
      workspaceId: workspaceObjectId(workspaceId),
      deletedAt: null,
    });

    if (!entity) {
      throw ApiError.notFound('FIR not found');
    }

    return entity;
  }

  async create(ctx: ServiceContext, input: CreateFirInput): Promise<IFir> {
    const policeStationKey = normalizePoliceStationKey(input.policeStation);

    const entity = await Fir.create({
      ...input,
      workspaceId: workspaceObjectId(ctx.workspaceId),
      policeStationKey,
      status: input.status ?? 'REGISTERED',
      bailStatus: input.bailStatus ?? 'NOT_APPLICABLE',
      registeredAt: input.registeredAt ?? new Date(),
      actsAndSections: input.actsAndSections ?? [],
      clientPartyId: input.clientPartyId ? toObjectId(input.clientPartyId) : undefined,
      accusedPartyIds: (input.accusedPartyIds ?? []).map(toObjectId),
      victimPartyIds: (input.victimPartyIds ?? []).map(toObjectId),
      officerPartyId: input.officerPartyId ? toObjectId(input.officerPartyId) : undefined,
      linkedCaseId: input.linkedCaseId ? toObjectId(input.linkedCaseId) : undefined,
      sourceComplaintId: input.sourceComplaintId ? toObjectId(input.sourceComplaintId) : undefined,
      createdBy: optionalActorObjectId(ctx.actorId),
      updatedBy: optionalActorObjectId(ctx.actorId),
    });

    await activityService.record({
      workspaceId: ctx.workspaceId,
      actorId: ctx.actorId,
      action: 'legal.fir.created',
      entityType: 'Fir',
      entityId: entity.id,
      correlationId: ctx.correlationId,
    });

    return entity;
  }

  async update(ctx: ServiceContext, id: string, input: UpdateFirInput): Promise<IFir> {
    const entity = await this.getById(ctx.workspaceId, id);

    if (input.status !== undefined) entity.status = input.status;
    if (input.bailStatus !== undefined) entity.bailStatus = input.bailStatus;
    if (input.investigationOfficer !== undefined) {
      entity.investigationOfficer = input.investigationOfficer;
    }
    if (input.summary !== undefined) entity.summary = input.summary;

    if (input.chargeSheet !== undefined) {
      entity.chargeSheet = {
        ...entity.chargeSheet,
        ...input.chargeSheet,
      };
      if (input.chargeSheet.filedAt) {
        entity.chargeSheetFiledAt = input.chargeSheet.filedAt;
      }
    }

    if (input.closureReport !== undefined) {
      entity.closureReport = {
        ...entity.closureReport,
        ...input.closureReport,
      };
      if (input.closureReport.reportedAt) {
        entity.closureReportAt = input.closureReport.reportedAt;
      }
    }

    if (input.courtTransfer !== undefined) {
      entity.courtTransfer = {
        ...entity.courtTransfer,
        ...input.courtTransfer,
      };
    }

    entity.updatedBy = optionalActorObjectId(ctx.actorId);
    await entity.save();

    await activityService.record({
      workspaceId: ctx.workspaceId,
      actorId: ctx.actorId,
      action: 'legal.fir.updated',
      entityType: 'Fir',
      entityId: entity.id,
      correlationId: ctx.correlationId,
    });

    return entity;
  }
}

export const firsService = new FirsService();
