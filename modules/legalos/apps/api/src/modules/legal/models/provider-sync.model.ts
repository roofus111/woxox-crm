import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { PROVIDER_IDS, SYNC_STATUSES } from '../enums.js';

export interface IProviderSync extends Document {
  workspaceId: mongoose.Types.ObjectId;
  provider: (typeof PROVIDER_IDS)[number];
  entityType: string;
  entityId: mongoose.Types.ObjectId;
  externalKey: string;
  status: (typeof SYNC_STATUSES)[number];
  lastRunAt?: Date;
  nextRunAt?: Date;
  lastSuccessAt?: Date;
  lastError?: string;
  attemptCount: number;
  payloadVersion?: string;
  normalizedSnapshot?: Record<string, unknown>;
  requestedBy?: mongoose.Types.ObjectId;
  correlationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProviderSyncSchema = new Schema<IProviderSync>(
  {
    workspaceId: { type: Schema.Types.ObjectId, required: true, index: true },
    provider: { type: String, enum: PROVIDER_IDS, required: true, index: true },
    entityType: { type: String, required: true, index: true },
    entityId: { type: Schema.Types.ObjectId, required: true, index: true },
    externalKey: { type: String, required: true },
    status: { type: String, enum: SYNC_STATUSES, default: 'PENDING', index: true },
    lastRunAt: Date,
    nextRunAt: { type: Date, index: true },
    lastSuccessAt: Date,
    lastError: String,
    attemptCount: { type: Number, default: 0 },
    payloadVersion: String,
    normalizedSnapshot: Schema.Types.Mixed,
    requestedBy: { type: Schema.Types.ObjectId },
    correlationId: String,
  },
  { timestamps: true, collection: 'legal_provider_syncs' },
);

ProviderSyncSchema.index(
  { workspaceId: 1, provider: 1, entityType: 1, externalKey: 1 },
  { unique: true },
);
ProviderSyncSchema.index({ nextRunAt: 1, status: 1 });

export const ProviderSync: Model<IProviderSync> =
  mongoose.models.ProviderSync ??
  mongoose.model<IProviderSync>('ProviderSync', ProviderSyncSchema);
