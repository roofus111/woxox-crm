import { ApiError } from '../../../common/ApiError.js';
import {
  buildPaginationMeta,
  buildSort,
  buildTextSearchFilter,
  paginationSkip,
} from '../../../common/pagination.js';
import type { ServiceContext } from '../../../common/types.js';
import { activityService } from '../../../host/activity.service.js';
import { outboxService } from '../../../host/outbox.service.js';
import { socketEmitter } from '../../../host/socket.emitter.js';
import { LegalCase, type ILegalCase } from '../models/legal-case.model.js';
import type { CaseListParams, CreateCaseInput, UpdateCaseInput } from '../validators/cases.validator.js';
import { enterpriseService } from './enterprise.service.js';
import {
  caseVisibilityFilter,
  optionalActorObjectId,
  toObjectId,
  workspaceObjectId,
  type AccessActor,
} from './case-access.util.js';

export class CasesService {
  async list(workspaceId: string, params: CaseListParams, actor?: AccessActor) {
    const filter: Record<string, unknown> = {
      workspaceId: workspaceObjectId(workspaceId),
      deletedAt: null,
      ...(params.status ? { status: params.status } : {}),
      ...(params.practiceArea ? { practiceArea: params.practiceArea } : {}),
      ...(params.clientPartyId
        ? { clientPartyIds: workspaceObjectId(params.clientPartyId) }
        : {}),
      ...buildTextSearchFilter(params.q, ['title', 'caseNumber', 'partiesSearch']),
    };

    if (actor) {
      const vis = await caseVisibilityFilter(workspaceId, actor);
      if (vis) Object.assign(filter, vis);
    }

    const skip = paginationSkip(params.page, params.limit);
    const sort = buildSort(params.sort, params.direction, { nextHearingAt: 1, createdAt: -1 });

    const [items, total] = await Promise.all([
      LegalCase.find(filter).sort(sort).skip(skip).limit(params.limit).lean(),
      LegalCase.countDocuments(filter),
    ]);

    return {
      items,
      meta: buildPaginationMeta(params.page, params.limit, total),
    };
  }

  async getById(workspaceId: string, id: string, actor?: AccessActor): Promise<ILegalCase> {
    const entity = await LegalCase.findOne({
      _id: toObjectId(id),
      workspaceId: workspaceObjectId(workspaceId),
      deletedAt: null,
    });

    if (!entity) {
      throw ApiError.notFound('Case not found');
    }

    if (actor) {
      await enterpriseService.assertCaseAccess(
        workspaceId,
        id,
        actor.id,
        actor.permissions,
        'VIEW',
      );
    }

    return entity;
  }

  async create(ctx: ServiceContext, input: CreateCaseInput): Promise<ILegalCase> {
    const actorOid = optionalActorObjectId(ctx.actorId);
    const entity = await LegalCase.create({
      ...input,
      workspaceId: workspaceObjectId(ctx.workspaceId),
      status: input.status ?? 'ACTIVE',
      visibility: 'RESTRICTED',
      clientPartyIds: (input.clientPartyIds ?? []).map(toObjectId),
      oppositePartyIds: (input.oppositePartyIds ?? []).map(toObjectId),
      advocateIds: (input.advocateIds ?? []).map(toObjectId),
      court: input.court ?? {},
      createdBy: actorOid,
      updatedBy: actorOid,
    });

    await enterpriseService.bootstrapCaseAccess(ctx, entity.id);

    await activityService.record({
      workspaceId: ctx.workspaceId,
      actorId: ctx.actorId,
      action: 'legal.case.created',
      entityType: 'LegalCase',
      entityId: entity.id,
      correlationId: ctx.correlationId,
    });

    await outboxService.publish('legal.case.created', {
      workspaceId: ctx.workspaceId,
      caseId: entity.id,
    });

    socketEmitter.emitCaseUpdated({
      workspaceId: ctx.workspaceId,
      entityId: entity.id,
      actor: ctx.actorId,
    });

    return entity;
  }

  async update(
    ctx: ServiceContext,
    id: string,
    input: UpdateCaseInput,
    permissions: string[] = [],
  ): Promise<ILegalCase> {
    await enterpriseService.assertCaseAccess(
      ctx.workspaceId,
      id,
      ctx.actorId,
      permissions,
      'EDIT',
    );

    const entity = await this.getById(ctx.workspaceId, id);

    if (input.title !== undefined) entity.title = input.title;
    if (input.caseNumber !== undefined) entity.caseNumber = input.caseNumber;
    if (input.status !== undefined) entity.status = input.status;
    if (input.court !== undefined) entity.court = { ...entity.court, ...input.court };
    if (input.clientPartyIds !== undefined) {
      entity.clientPartyIds = input.clientPartyIds.map(toObjectId);
    }
    if (input.oppositePartyIds !== undefined) {
      entity.oppositePartyIds = input.oppositePartyIds.map(toObjectId);
    }
    if (input.advocateIds !== undefined) {
      entity.advocateIds = input.advocateIds.map(toObjectId);
    }
    if (input.practiceArea !== undefined) entity.practiceArea = input.practiceArea;
    if (input.nextHearingAt !== undefined) entity.nextHearingAt = input.nextHearingAt;
    if (input.openedAt !== undefined) entity.openedAt = input.openedAt;
    if (input.summary !== undefined) entity.summary = input.summary;
    if (input.tags !== undefined) entity.tags = input.tags;

    entity.updatedBy = optionalActorObjectId(ctx.actorId);
    await entity.save();

    await activityService.record({
      workspaceId: ctx.workspaceId,
      actorId: ctx.actorId,
      action: 'legal.case.updated',
      entityType: 'LegalCase',
      entityId: entity.id,
      correlationId: ctx.correlationId,
    });

    socketEmitter.emitCaseUpdated({
      workspaceId: ctx.workspaceId,
      entityId: entity.id,
      actor: ctx.actorId,
    });

    return entity;
  }
}

export const casesService = new CasesService();
