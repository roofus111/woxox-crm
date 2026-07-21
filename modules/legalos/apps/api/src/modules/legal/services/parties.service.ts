import mongoose from 'mongoose';
import { ApiError } from '../../../common/ApiError.js';
import {
  buildPaginationMeta,
  buildSort,
  buildTextSearchFilter,
  paginationSkip,
} from '../../../common/pagination.js';
import type { ServiceContext } from '../../../common/types.js';
import { activityService } from '../../../host/activity.service.js';
import { Party, type IParty } from '../models/party.model.js';
import type {
  CreatePartyInput,
  PartyListParams,
  UpdatePartyInput,
} from '../validators/parties.validator.js';

function toObjectId(id: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(id);
}

function workspaceObjectId(workspaceId: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(workspaceId);
}

export class PartiesService {
  async list(workspaceId: string, params: PartyListParams) {
    const filter: Record<string, unknown> = {
      workspaceId: workspaceObjectId(workspaceId),
      deletedAt: null,
      ...(params.type ? { type: params.type } : {}),
      ...buildTextSearchFilter(params.q, ['displayName', 'organizationName']),
    };

    const skip = paginationSkip(params.page, params.limit);
    const sort = buildSort(params.sort, params.direction, { displayName: 1, createdAt: -1 });

    const [items, total] = await Promise.all([
      Party.find(filter).sort(sort).skip(skip).limit(params.limit).lean(),
      Party.countDocuments(filter),
    ]);

    return { items, meta: buildPaginationMeta(params.page, params.limit, total) };
  }

  async getById(workspaceId: string, id: string): Promise<IParty> {
    const entity = await Party.findOne({
      _id: toObjectId(id),
      workspaceId: workspaceObjectId(workspaceId),
      deletedAt: null,
    });

    if (!entity) {
      throw ApiError.notFound('Party not found');
    }

    return entity;
  }

  async create(ctx: ServiceContext, input: CreatePartyInput): Promise<IParty> {
    const entity = await Party.create({
      ...input,
      workspaceId: workspaceObjectId(ctx.workspaceId),
      createdBy: toObjectId(ctx.actorId),
      updatedBy: toObjectId(ctx.actorId),
    });

    await activityService.record({
      workspaceId: ctx.workspaceId,
      actorId: ctx.actorId,
      action: 'legal.party.created',
      entityType: 'Party',
      entityId: entity.id,
      correlationId: ctx.correlationId,
    });

    return entity;
  }

  async update(ctx: ServiceContext, id: string, input: UpdatePartyInput): Promise<IParty> {
    const entity = await this.getById(ctx.workspaceId, id);

    Object.assign(entity, input);
    entity.updatedBy = toObjectId(ctx.actorId);
    await entity.save();

    await activityService.record({
      workspaceId: ctx.workspaceId,
      actorId: ctx.actorId,
      action: 'legal.party.updated',
      entityType: 'Party',
      entityId: entity.id,
      correlationId: ctx.correlationId,
    });

    return entity;
  }

  async softDelete(ctx: ServiceContext, id: string): Promise<IParty> {
    const entity = await this.getById(ctx.workspaceId, id);
    entity.deletedAt = new Date();
    entity.deletedBy = ctx.actorId;
    entity.updatedBy = toObjectId(ctx.actorId);
    await entity.save();

    await activityService.record({
      workspaceId: ctx.workspaceId,
      actorId: ctx.actorId,
      action: 'legal.party.deleted',
      entityType: 'Party',
      entityId: entity.id,
      correlationId: ctx.correlationId,
    });

    return entity;
  }
}

export const partiesService = new PartiesService();
