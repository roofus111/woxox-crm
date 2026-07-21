import mongoose from 'mongoose';
import { ApiError } from '../../../common/ApiError.js';
import {
  buildPaginationMeta,
  buildSort,
  buildTextSearchFilter,
  paginationSkip,
} from '../../../common/pagination.js';
import type { ServiceContext } from '../../../common/types.js';
import { Filing, type IFiling } from '../models/filing.model.js';
import { LegalCase } from '../models/legal-case.model.js';
import type {
  CreateFilingInput,
  FilingListParams,
  UpdateFilingInput,
} from '../validators/filings.validator.js';

function oid(id: string) {
  return new mongoose.Types.ObjectId(id);
}

export class FilingsService {
  async list(workspaceId: string, params: FilingListParams) {
    const filter: Record<string, unknown> = {
      workspaceId: oid(workspaceId),
      deletedAt: null,
      ...(params.caseId ? { caseId: oid(params.caseId) } : {}),
      ...(params.status ? { status: params.status } : {}),
      ...buildTextSearchFilter(params.q, ['title', 'filingType', 'diaryNumber']),
    };
    const skip = paginationSkip(params.page, params.limit);
    const sort = buildSort(params.sort, params.direction, { createdAt: -1 });
    const [items, total] = await Promise.all([
      Filing.find(filter).sort(sort).skip(skip).limit(params.limit).lean(),
      Filing.countDocuments(filter),
    ]);
    return { items, meta: buildPaginationMeta(params.page, params.limit, total) };
  }

  async getById(workspaceId: string, id: string): Promise<IFiling> {
    const entity = await Filing.findOne({
      _id: oid(id),
      workspaceId: oid(workspaceId),
      deletedAt: null,
    });
    if (!entity) throw ApiError.notFound('Filing not found');
    return entity;
  }

  async create(ctx: ServiceContext, input: CreateFilingInput): Promise<IFiling> {
    const legalCase = await LegalCase.exists({
      _id: oid(input.caseId),
      workspaceId: oid(ctx.workspaceId),
      deletedAt: null,
    });
    if (!legalCase) throw ApiError.notFound('Case not found');

    return Filing.create({
      ...input,
      workspaceId: oid(ctx.workspaceId),
      caseId: oid(input.caseId),
      status: input.status ?? 'DRAFT',
      checklist: (input.checklist ?? []).map((c) => ({ item: c.item, done: c.done ?? false })),
      createdBy: oid(ctx.actorId),
      updatedBy: oid(ctx.actorId),
    });
  }

  async update(ctx: ServiceContext, id: string, input: UpdateFilingInput): Promise<IFiling> {
    const entity = await this.getById(ctx.workspaceId, id);
    Object.assign(entity, input, { updatedBy: oid(ctx.actorId) });
    await entity.save();
    return entity;
  }
}

export const filingsService = new FilingsService();
