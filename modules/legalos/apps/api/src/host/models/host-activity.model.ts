import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IHostActivity extends Document {
  workspaceId: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  summary?: string;
  metadata?: Record<string, unknown>;
  correlationId?: string;
  occurredAt: Date;
}

const HostActivitySchema = new Schema<IHostActivity>(
  {
    workspaceId: { type: String, required: true, index: true },
    actorId: { type: String, required: true, index: true },
    action: { type: String, required: true, index: true },
    entityType: { type: String, required: true, index: true },
    entityId: { type: String, required: true, index: true },
    summary: String,
    metadata: Schema.Types.Mixed,
    correlationId: String,
    occurredAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false, collection: 'legal_host_activity' },
);

export const HostActivity: Model<IHostActivity> =
  mongoose.models.HostActivity ?? mongoose.model<IHostActivity>('HostActivity', HostActivitySchema);
