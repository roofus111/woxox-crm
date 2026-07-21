import mongoose from 'mongoose';
import { ApiError } from '../../../common/ApiError.js';
import type { ServiceContext } from '../../../common/types.js';
import { outboxService } from '../../../host/outbox.service.js';
import { socketEmitter } from '../../../host/socket.emitter.js';
import type { ProviderId } from '../enums.js';
import { ProviderSync } from '../models/provider-sync.model.js';
import { LegalCase } from '../models/legal-case.model.js';
import { Complaint } from '../models/complaint.model.js';
import { Fir } from '../models/fir.model.js';
import {
  getCourtDataProvider,
  getProvider,
  listAllCapabilities,
} from '../../../providers/registry.js';
import type { SyncRequestInput } from '../validators/providers.validator.js';
import { appendAuditEvent } from '../models/audit-event.model.js';

function toObjectId(id: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(id);
}

function workspaceObjectId(workspaceId: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(workspaceId);
}

async function resolveExternalKey(
  workspaceId: string,
  entityType: SyncRequestInput['entityType'],
  entityId: string,
  externalKey?: string,
): Promise<string> {
  if (externalKey) {
    return externalKey;
  }

  if (entityType === 'case') {
    const entity = await LegalCase.findOne({
      _id: toObjectId(entityId),
      workspaceId: workspaceObjectId(workspaceId),
      deletedAt: null,
    });
    if (!entity) throw ApiError.notFound('Case not found');
    return entity.court?.cino ?? entity.caseNumber ?? entityId;
  }

  if (entityType === 'complaint') {
    const entity = await Complaint.findOne({
      _id: toObjectId(entityId),
      workspaceId: workspaceObjectId(workspaceId),
      deletedAt: null,
    });
    if (!entity) throw ApiError.notFound('Complaint not found');
    return entity.complaintNumber;
  }

  const entity = await Fir.findOne({
    _id: toObjectId(entityId),
    workspaceId: workspaceObjectId(workspaceId),
    deletedAt: null,
  });
  if (!entity) throw ApiError.notFound('FIR not found');
  return `${entity.firNumber}:${entity.policeStationKey}`;
}

export class ProvidersService {
  getCapabilities() {
    return listAllCapabilities();
  }

  async queueSync(ctx: ServiceContext, providerId: ProviderId, input: SyncRequestInput) {
    const provider = getProvider(providerId);
    if (!provider) {
      throw ApiError.notFound(`Unknown provider: ${providerId}`);
    }

    const externalKey = await resolveExternalKey(
      ctx.workspaceId,
      input.entityType,
      input.entityId,
      input.externalKey,
    );

    const courtProvider = getCourtDataProvider(providerId);
    let outcomeMessage = 'Sync queued';

    if (courtProvider) {
      const outcome = await courtProvider.sync({
        workspaceId: ctx.workspaceId,
        entityType: input.entityType,
        entityId: input.entityId,
        externalKey,
        force: input.force,
      });
      outcomeMessage = outcome.message ?? outcome.status;
    }

    const syncRecord = await ProviderSync.findOneAndUpdate(
      {
        workspaceId: workspaceObjectId(ctx.workspaceId),
        provider: providerId,
        entityType: input.entityType,
        externalKey,
      },
      {
        $set: {
          entityId: toObjectId(input.entityId),
          status: courtProvider ? 'PENDING' : 'DISABLED',
          nextRunAt: new Date(),
          requestedBy: toObjectId(ctx.actorId),
          correlationId: ctx.correlationId,
          lastError: courtProvider ? undefined : 'Provider does not support court sync',
        },
        $inc: { attemptCount: 1 },
        $setOnInsert: {
          workspaceId: workspaceObjectId(ctx.workspaceId),
          provider: providerId,
          entityType: input.entityType,
          externalKey,
        },
      },
      { upsert: true, new: true },
    );

    await appendAuditEvent({
      workspaceId: workspaceObjectId(ctx.workspaceId),
      entityType: 'ProviderSync',
      entityId: syncRecord._id,
      action: 'SYNC_REQUESTED',
      actorId: ctx.actorId,
      correlationId: ctx.correlationId,
      metadata: { provider: providerId, externalKey },
    });

    await outboxService.publish('legal.provider.sync.requested', {
      workspaceId: ctx.workspaceId,
      provider: providerId,
      syncId: syncRecord.id,
      externalKey,
    });

    socketEmitter.emitProviderSyncCompleted({
      workspaceId: ctx.workspaceId,
      entityId: syncRecord.id,
      actor: ctx.actorId,
      data: { status: syncRecord.status, message: outcomeMessage },
    });

    return { sync: syncRecord, message: outcomeMessage };
  }
}

export const providersService = new ProvidersService();
