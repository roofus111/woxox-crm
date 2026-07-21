import mongoose from 'mongoose';
import { ApiError } from '../../../common/ApiError.js';
import {
  buildPaginationMeta,
  buildSort,
  paginationSkip,
} from '../../../common/pagination.js';
import type { ServiceContext } from '../../../common/types.js';
import { KnowledgeDoc, type IKnowledgeDoc } from '../models/knowledge.model.js';
import type {
  CreateKnowledgeInput,
  KnowledgeListParams,
  UpdateKnowledgeInput,
} from '../validators/knowledge.validator.js';

function oid(id: string) {
  return new mongoose.Types.ObjectId(id);
}

export class KnowledgeService {
  async list(workspaceId: string, params: KnowledgeListParams) {
    const filter: Record<string, unknown> = {
      workspaceId: oid(workspaceId),
      deletedAt: null,
      ...(params.category ? { category: params.category } : {}),
    };
    if (params.q) {
      filter.$text = { $search: params.q };
    }
    const skip = paginationSkip(params.page, params.limit);
    const sort = buildSort(params.sort, params.direction, { updatedAt: -1 });
    const [items, total] = await Promise.all([
      KnowledgeDoc.find(filter).sort(sort).skip(skip).limit(params.limit).lean(),
      KnowledgeDoc.countDocuments(filter),
    ]);
    return { items, meta: buildPaginationMeta(params.page, params.limit, total) };
  }

  async getById(workspaceId: string, id: string): Promise<IKnowledgeDoc> {
    const entity = await KnowledgeDoc.findOne({
      _id: oid(id),
      workspaceId: oid(workspaceId),
      deletedAt: null,
    });
    if (!entity) throw ApiError.notFound('Knowledge document not found');
    return entity;
  }

  async create(ctx: ServiceContext, input: CreateKnowledgeInput): Promise<IKnowledgeDoc> {
    return KnowledgeDoc.create({
      ...input,
      workspaceId: oid(ctx.workspaceId),
      tags: input.tags ?? [],
      bookmarkedBy: [],
      createdBy: oid(ctx.actorId),
      updatedBy: oid(ctx.actorId),
    });
  }

  async update(ctx: ServiceContext, id: string, input: UpdateKnowledgeInput) {
    const entity = await this.getById(ctx.workspaceId, id);
    Object.assign(entity, input, { updatedBy: oid(ctx.actorId) });
    await entity.save();
    return entity;
  }

  async bookmark(ctx: ServiceContext, id: string) {
    const entity = await this.getById(ctx.workspaceId, id);
    const actor = oid(ctx.actorId);
    if (!entity.bookmarkedBy.some((b) => b.equals(actor))) {
      entity.bookmarkedBy.push(actor);
      entity.updatedBy = actor;
      await entity.save();
    }
    return entity;
  }
}

export const knowledgeService = new KnowledgeService();
