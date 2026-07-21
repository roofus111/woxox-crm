import { HostActivity } from './models/host-activity.model.js';
import { logger } from '../common/logger.js';
import { socketEmitter } from './socket.emitter.js';

export interface ActivityRecordInput {
  workspaceId: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  summary?: string;
  metadata?: Record<string, unknown>;
  correlationId?: string;
}

export interface ActivityRecord extends ActivityRecordInput {
  id: string;
  occurredAt: Date;
}

export class ActivityService {
  async record(input: ActivityRecordInput): Promise<ActivityRecord> {
    const doc = await HostActivity.create({
      ...input,
      occurredAt: new Date(),
    });

    socketEmitter.emit('legal:activity.recorded', {
      workspaceId: input.workspaceId,
      entityId: input.entityId,
      eventId: doc.id,
      occurredAt: doc.occurredAt.toISOString(),
      actor: input.actorId,
      data: { action: input.action, entityType: input.entityType },
    });

    logger.info('activity.recorded', {
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
    });

    return {
      ...input,
      id: doc.id,
      occurredAt: doc.occurredAt,
    };
  }

  async listByEntity(
    workspaceId: string,
    entityType: string,
    entityId: string,
  ): Promise<ActivityRecord[]> {
    const rows = await HostActivity.find({ workspaceId, entityType, entityId })
      .sort({ occurredAt: -1 })
      .limit(200)
      .lean();

    return rows.map((r) => ({
      id: String(r._id),
      workspaceId: r.workspaceId,
      actorId: r.actorId,
      action: r.action,
      entityType: r.entityType,
      entityId: r.entityId,
      summary: r.summary,
      metadata: r.metadata,
      correlationId: r.correlationId,
      occurredAt: r.occurredAt,
    }));
  }
}

export const activityService = new ActivityService();
