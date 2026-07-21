import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IHostOutbox extends Document {
  topic: string;
  workspaceId: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'published' | 'failed';
  occurredAt: Date;
  publishedAt?: Date;
  errorMessage?: string;
}

const HostOutboxSchema = new Schema<IHostOutbox>(
  {
    topic: { type: String, required: true, index: true },
    workspaceId: { type: String, required: true, index: true },
    payload: { type: Schema.Types.Mixed, required: true },
    status: {
      type: String,
      enum: ['pending', 'published', 'failed'],
      default: 'pending',
      index: true,
    },
    occurredAt: { type: Date, default: Date.now, index: true },
    publishedAt: Date,
    errorMessage: String,
  },
  { timestamps: false, collection: 'legal_host_outbox' },
);

export const HostOutbox: Model<IHostOutbox> =
  mongoose.models.HostOutbox ?? mongoose.model<IHostOutbox>('HostOutbox', HostOutboxSchema);
