import { ApiError } from '../../../common/ApiError.js';
import {
  buildPaginationMeta,
  buildSort,
  paginationSkip,
} from '../../../common/pagination.js';
import type { ServiceContext } from '../../../common/types.js';
import { activityService } from '../../../host/activity.service.js';
import { notificationService } from '../../../host/notification.service.js';
import { outboxService } from '../../../host/outbox.service.js';
import { Hearing, type IHearing } from '../models/hearing.model.js';
import { LegalCase } from '../models/legal-case.model.js';
import { pushLegalNotification } from '../models/legal-notification.model.js';
import type { CreateHearingInput, HearingListParams } from '../validators/hearings.validator.js';

import {
  resolveVisibleCaseIds,
  optionalActorObjectId,
  toObjectId,
  workspaceObjectId,
  type AccessActor,
} from './case-access.util.js';
import { enterpriseService } from './enterprise.service.js';

export class HearingsService {
  async listHearings(workspaceId: string, params: HearingListParams, actor?: AccessActor) {
    const filter: Record<string, unknown> = {
      workspaceId: workspaceObjectId(workspaceId),
      deletedAt: null,
      ...(params.caseId ? { caseId: toObjectId(params.caseId) } : {}),
      ...(params.status ? { status: params.status } : {}),
    };

    if (params.from || params.to) {
      filter.scheduledAt = {
        ...(params.from ? { $gte: params.from } : {}),
        ...(params.to ? { $lte: params.to } : {}),
      };
    }

    if (params.q) {
      filter.$or = [
        { title: new RegExp(params.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
        { purpose: new RegExp(params.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
        { 'court.name': new RegExp(params.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
      ];
    }

    if (actor && params.caseId) {
      await enterpriseService.assertCaseAccess(
        workspaceId,
        params.caseId,
        actor.id,
        actor.permissions,
        'VIEW',
      );
    } else if (actor) {
      const visible = await resolveVisibleCaseIds(workspaceId, actor);
      if (visible !== 'ALL') {
        filter.caseId = { $in: visible };
      }
    }

    const skip = paginationSkip(params.page, params.limit);
    const sort = buildSort(params.sort, params.direction, { scheduledAt: 1, createdAt: -1 });

    const [items, total] = await Promise.all([
      Hearing.find(filter).sort(sort).skip(skip).limit(params.limit).lean(),
      Hearing.countDocuments(filter),
    ]);

    return { items, meta: buildPaginationMeta(params.page, params.limit, total) };
  }

  async createForCase(
    ctx: ServiceContext,
    caseId: string,
    input: CreateHearingInput,
  ): Promise<IHearing> {
    const legalCase = await LegalCase.findOne({
      _id: toObjectId(caseId),
      workspaceId: workspaceObjectId(ctx.workspaceId),
      deletedAt: null,
    });

    if (!legalCase) {
      throw ApiError.notFound('Case not found');
    }

    const hearing = await Hearing.create({
      workspaceId: workspaceObjectId(ctx.workspaceId),
      caseId: legalCase._id,
      title: input.title,
      scheduledAt: input.scheduledAt,
      status: input.status ?? 'SCHEDULED',
      court: input.court ?? legalCase.court ?? {},
      assignedAdvocateIds: input.assignedAdvocateIds
        ? input.assignedAdvocateIds.map(toObjectId)
        : legalCase.advocateIds,
      purpose: input.purpose,
      notes: input.notes,
      createdBy: optionalActorObjectId(ctx.actorId),
      updatedBy: optionalActorObjectId(ctx.actorId),
    });

    legalCase.hearingIds.push(hearing._id);
    if (!legalCase.nextHearingAt || input.scheduledAt < legalCase.nextHearingAt) {
      legalCase.nextHearingAt = input.scheduledAt;
    }
    legalCase.updatedBy = optionalActorObjectId(ctx.actorId);
    await legalCase.save();

    await activityService.record({
      workspaceId: ctx.workspaceId,
      actorId: ctx.actorId,
      action: 'legal.hearing.scheduled',
      entityType: 'Hearing',
      entityId: hearing.id,
      metadata: { caseId: legalCase.id },
      correlationId: ctx.correlationId,
    });

    await outboxService.publish('legal.hearing.scheduled', {
      workspaceId: ctx.workspaceId,
      hearingId: hearing.id,
      caseId: legalCase.id,
      scheduledAt: input.scheduledAt.toISOString(),
    });

    await pushLegalNotification({
      workspaceId: ctx.workspaceId,
      type: 'HEARING_SCHEDULED',
      title: 'Hearing scheduled',
      body: `"${hearing.title}" scheduled for ${input.scheduledAt.toISOString()} (matter ${legalCase.caseNumber ?? legalCase.id})`,
      entityType: 'Hearing',
      entityId: hearing.id,
    });

    for (const advocateId of hearing.assignedAdvocateIds) {
      await notificationService.sendHearingReminder({
        workspaceId: ctx.workspaceId,
        userId: advocateId.toString(),
        hearingId: hearing.id,
        caseTitle: legalCase.title,
        scheduledAt: input.scheduledAt,
      });

      await pushLegalNotification({
        workspaceId: ctx.workspaceId,
        userId: advocateId.toString(),
        type: 'HEARING_REMINDER',
        title: 'Hearing scheduled',
        body: `"${hearing.title}" scheduled for ${input.scheduledAt.toISOString()}`,
        entityType: 'Hearing',
        entityId: hearing.id,
      });
    }

    return hearing;
  }

  async listUpcoming(workspaceId: string, from = new Date(), limit = 50) {
    return Hearing.find({
      workspaceId: workspaceObjectId(workspaceId),
      deletedAt: null,
      scheduledAt: { $gte: from },
      status: { $in: ['SCHEDULED', 'ADJOURNED'] },
    })
      .sort({ scheduledAt: 1 })
      .limit(limit)
      .lean();
  }
}

export const hearingsService = new HearingsService();
