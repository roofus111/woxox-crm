import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { logger } from '../common/logger.js';

export interface SocketEventPayload {
  workspaceId: string;
  entityId: string;
  eventId: string;
  occurredAt: string;
  actor?: string;
  data?: Record<string, unknown>;
}

const eventLog: Array<{ event: string; payload: SocketEventPayload }> = [];
let io: Server | null = null;

export class SocketEmitter {
  private readonly namespace = '/legal';

  attach(httpServer: HttpServer): void {
    const origins = env.CORS_ORIGIN.split(',').map((o) => o.trim());
    io = new Server(httpServer, {
      path: '/socket.io',
      cors: { origin: origins, credentials: true },
    });

    const nsp = io.of(this.namespace);
    nsp.on('connection', (socket) => {
      const workspaceId = String(socket.handshake.query.workspaceId ?? '');
      if (workspaceId) {
        void socket.join(`workspace:${workspaceId}`);
      }
      logger.info('socket.connected', { id: socket.id, workspaceId });
    });

    logger.info('socket.io attached', { namespace: this.namespace });
  }

  emit(event: string, payload: SocketEventPayload): void {
    eventLog.push({ event, payload });
    if (eventLog.length > 500) eventLog.shift();

    if (io) {
      io.of(this.namespace).to(`workspace:${payload.workspaceId}`).emit(event, payload);
    }
  }

  emitCaseUpdated(payload: Omit<SocketEventPayload, 'eventId' | 'occurredAt'>): void {
    this.emit('legal:case.updated', {
      ...payload,
      eventId: `evt_${Date.now()}`,
      occurredAt: new Date().toISOString(),
    });
  }

  emitHearingReminder(payload: Omit<SocketEventPayload, 'eventId' | 'occurredAt'>): void {
    this.emit('legal:hearing.reminder', {
      ...payload,
      eventId: `evt_${Date.now()}`,
      occurredAt: new Date().toISOString(),
    });
  }

  emitProviderSyncCompleted(payload: Omit<SocketEventPayload, 'eventId' | 'occurredAt'>): void {
    this.emit('legal:provider.sync.completed', {
      ...payload,
      eventId: `evt_${Date.now()}`,
      occurredAt: new Date().toISOString(),
    });
  }

  emitEvidenceProcessed(payload: Omit<SocketEventPayload, 'eventId' | 'occurredAt'>): void {
    this.emit('legal:evidence.processed', {
      ...payload,
      eventId: `evt_${Date.now()}`,
      occurredAt: new Date().toISOString(),
    });
  }

  getRecentEvents(limit = 50): typeof eventLog {
    return eventLog.slice(-limit);
  }
}

export const socketEmitter = new SocketEmitter();
