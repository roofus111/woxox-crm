import { HostOutbox } from './models/host-outbox.model.js';
import { logger } from '../common/logger.js';
import { env } from '../config/env.js';
import { socketEmitter } from './socket.emitter.js';

export interface OutboxMessage<TPayload = Record<string, unknown>> {
  id: string;
  topic: string;
  workspaceId: string;
  payload: TPayload;
  occurredAt: Date;
  status: 'pending' | 'published' | 'failed';
}

export class OutboxService {
  async publish<TPayload extends Record<string, unknown>>(
    topic: string,
    payload: TPayload & { workspaceId: string },
  ): Promise<OutboxMessage<TPayload>> {
    const doc = await HostOutbox.create({
      topic,
      workspaceId: payload.workspaceId,
      payload,
      status: 'pending',
      occurredAt: new Date(),
    });

    try {
      if (env.WOXOX_HOST_API_URL) {
        const res = await fetch(`${env.WOXOX_HOST_API_URL.replace(/\/$/, '')}/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, payload }),
        });
        if (!res.ok) {
          throw new Error(`Host event bus returned ${res.status}`);
        }
      }

      doc.status = 'published';
      doc.publishedAt = new Date();
      await doc.save();

      socketEmitter.emit(topic, {
        workspaceId: payload.workspaceId,
        entityId: String((payload as { entityId?: string }).entityId ?? doc.id),
        eventId: doc.id,
        occurredAt: doc.occurredAt.toISOString(),
        data: payload,
      });

      logger.info('outbox.published', { topic, id: doc.id });
    } catch (err) {
      doc.status = 'failed';
      doc.errorMessage = err instanceof Error ? err.message : String(err);
      await doc.save();
      logger.error('outbox.failed', { topic, id: doc.id, err: doc.errorMessage });
    }

    return {
      id: doc.id,
      topic,
      workspaceId: payload.workspaceId,
      payload,
      occurredAt: doc.occurredAt,
      status: doc.status,
    };
  }

  async listPending(limit = 100): Promise<OutboxMessage[]> {
    const rows = await HostOutbox.find({ status: 'pending' }).sort({ occurredAt: 1 }).limit(limit).lean();
    return rows.map((r) => ({
      id: String(r._id),
      topic: r.topic,
      workspaceId: r.workspaceId,
      payload: r.payload,
      occurredAt: r.occurredAt,
      status: r.status,
    }));
  }

  async markPublished(id: string): Promise<void> {
    await HostOutbox.findByIdAndUpdate(id, {
      status: 'published',
      publishedAt: new Date(),
    });
  }
}

export const outboxService = new OutboxService();
