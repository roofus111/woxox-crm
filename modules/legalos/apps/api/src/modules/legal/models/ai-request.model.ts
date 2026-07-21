import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { AI_TASKS } from '../enums.js';

export type AiRequestStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface AiSourceRef {
  type: 'case' | 'evidence' | 'research' | 'document';
  id: string;
  label?: string;
}

export interface IAiRequest extends Omit<Document, 'model'> {
  workspaceId: mongoose.Types.ObjectId;
  task: (typeof AI_TASKS)[number];
  status: AiRequestStatus;
  prompt?: string;
  locale: string;
  caseId?: mongoose.Types.ObjectId;
  sourceRefs: AiSourceRef[];
  redactionApplied: boolean;
  modelName?: string;
  result?: string;
  citations?: string[];
  reviewRequired: boolean;
  errorMessage?: string;
  requestedBy: mongoose.Types.ObjectId;
  completedAt?: Date;
  correlationId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const AiRequestSchema = new Schema<IAiRequest>(
  {
    workspaceId: { type: Schema.Types.ObjectId, required: true, index: true },
    task: { type: String, enum: AI_TASKS, required: true, index: true },
    status: {
      type: String,
      enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    prompt: { type: String, maxlength: 20000 },
    locale: { type: String, default: 'en-IN' },
    caseId: { type: Schema.Types.ObjectId, ref: 'LegalCase' },
    sourceRefs: [
      {
        type: { type: String, enum: ['case', 'evidence', 'research', 'document'], required: true },
        id: { type: String, required: true },
        label: String,
      },
    ],
    redactionApplied: { type: Boolean, default: false },
    modelName: { type: String },
    result: { type: String, maxlength: 100000 },
    citations: [String],
    reviewRequired: { type: Boolean, default: true },
    errorMessage: String,
    requestedBy: { type: Schema.Types.ObjectId, required: true },
    completedAt: Date,
    correlationId: String,
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true, collection: 'legal_ai_requests' },
);

AiRequestSchema.index({ workspaceId: 1, task: 1, createdAt: -1 });
AiRequestSchema.index({ workspaceId: 1, status: 1, createdAt: -1 });

export const AiRequest: Model<IAiRequest> =
  mongoose.models.AiRequest ?? mongoose.model<IAiRequest>('AiRequest', AiRequestSchema);
