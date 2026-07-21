import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { AUDIT_ACTIONS } from '../enums.js';

export interface IAuditEvent extends Document {
  workspaceId: mongoose.Types.ObjectId;
  entityType: string;
  entityId: mongoose.Types.ObjectId;
  action: (typeof AUDIT_ACTIONS)[number];
  actorId: string;
  correlationId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  occurredAt: Date;
}

const AuditEventSchema = new Schema<IAuditEvent>(
  {
    workspaceId: { type: Schema.Types.ObjectId, required: true, index: true },
    entityType: { type: String, required: true, index: true },
    entityId: { type: Schema.Types.ObjectId, required: true, index: true },
    action: { type: String, enum: AUDIT_ACTIONS, required: true },
    actorId: { type: String, required: true },
    correlationId: { type: String, index: true },
    ipAddress: String,
    userAgent: String,
    metadata: Schema.Types.Mixed,
    occurredAt: { type: Date, required: true, default: Date.now, index: true },
  },
  { timestamps: false, collection: 'legal_audit_events' },
);

AuditEventSchema.index({ workspaceId: 1, entityType: 1, entityId: 1, occurredAt: -1 });

export const AuditEvent: Model<IAuditEvent> =
  mongoose.models.AuditEvent ?? mongoose.model<IAuditEvent>('AuditEvent', AuditEventSchema);

export async function appendAuditEvent(
  input: Omit<IAuditEvent, keyof Document | 'occurredAt'> & { occurredAt?: Date },
): Promise<IAuditEvent> {
  return AuditEvent.create({
    ...input,
    occurredAt: input.occurredAt ?? new Date(),
  });
}
