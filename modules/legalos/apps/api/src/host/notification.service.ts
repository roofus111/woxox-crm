import { createLegalNotification } from '../modules/legal/models/legal-notification.model.js';
import { logger } from '../common/logger.js';
import { env } from '../config/env.js';
import { socketEmitter } from './socket.emitter.js';

export type NotificationChannel = 'in_app' | 'email' | 'push' | 'sms' | 'whatsapp';

export interface NotificationInput {
  workspaceId: string;
  userId: string;
  channel: NotificationChannel;
  templateKey: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  idempotencyKey?: string;
}

export interface NotificationRecord extends NotificationInput {
  id: string;
  sentAt: Date;
  status: 'queued' | 'sent' | 'failed';
}

const sentKeys = new Set<string>();

export class NotificationService {
  async send(input: NotificationInput): Promise<NotificationRecord> {
    if (input.idempotencyKey && sentKeys.has(input.idempotencyKey)) {
      return {
        ...input,
        id: `ntf_dedupe_${input.idempotencyKey}`,
        sentAt: new Date(),
        status: 'sent',
      };
    }

    const legal = await createLegalNotification({
      workspaceId: input.workspaceId,
      userId: input.userId,
      type: 'GENERAL',
      title: input.title,
      body: input.body,
      entityType: typeof input.data?.entityType === 'string' ? input.data.entityType : undefined,
      entityId: typeof input.data?.entityId === 'string' ? input.data.entityId : undefined,
    });

    if (env.WOXOX_HOST_API_URL && input.channel !== 'in_app') {
      try {
        await fetch(`${env.WOXOX_HOST_API_URL.replace(/\/$/, '')}/notifications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });
      } catch (err) {
        logger.warn('host.notification.forward_failed', {
          err: err instanceof Error ? err.message : String(err),
        });
      }
    }

    socketEmitter.emit('legal:notification.created', {
      workspaceId: input.workspaceId,
      entityId: legal.id,
      eventId: legal.id,
      occurredAt: new Date().toISOString(),
      actor: input.userId,
      data: { title: input.title, templateKey: input.templateKey },
    });

    if (input.idempotencyKey) {
      sentKeys.add(input.idempotencyKey);
    }

    return {
      ...input,
      id: legal.id,
      sentAt: new Date(),
      status: 'sent',
    };
  }

  async sendHearingReminder(input: {
    workspaceId: string;
    userId: string;
    hearingId: string;
    caseTitle: string;
    scheduledAt: Date;
  }): Promise<NotificationRecord> {
    return this.send({
      workspaceId: input.workspaceId,
      userId: input.userId,
      channel: 'in_app',
      templateKey: 'legal.hearing.reminder',
      title: 'Upcoming hearing',
      body: `Hearing scheduled for "${input.caseTitle}" on ${input.scheduledAt.toISOString()}`,
      data: { hearingId: input.hearingId, entityType: 'Hearing', entityId: input.hearingId },
      idempotencyKey: `hearing-reminder:${input.hearingId}:${input.scheduledAt.toISOString()}`,
    });
  }
}

export const notificationService = new NotificationService();
