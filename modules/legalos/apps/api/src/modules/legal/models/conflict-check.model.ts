import mongoose, { Schema, type Document, type Model } from 'mongoose';

export const CONFLICT_RISKS = ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'BLOCK'] as const;
export type ConflictRisk = (typeof CONFLICT_RISKS)[number];

export const CONFLICT_STATUSES = ['OPEN', 'ACCEPTED', 'REJECTED'] as const;
export type ConflictStatus = (typeof CONFLICT_STATUSES)[number];

export interface ConflictMatch {
  partyId?: mongoose.Types.ObjectId;
  name: string;
  reason: string;
  strength: number;
}

export interface IConflictCheck extends Document {
  workspaceId: mongoose.Types.ObjectId;
  title?: string;
  partyNames: string[];
  partyIds?: mongoose.Types.ObjectId[];
  score: number;
  risk: ConflictRisk;
  matches: ConflictMatch[];
  status: ConflictStatus;
  caseId?: mongoose.Types.ObjectId;
  createdBy: string;
  createdAt: Date;
}

const ConflictMatchSchema = new Schema<ConflictMatch>(
  {
    partyId: { type: Schema.Types.ObjectId, ref: 'Party' },
    name: { type: String, required: true, trim: true },
    reason: { type: String, required: true, trim: true },
    strength: { type: Number, required: true, min: 0, max: 100 },
  },
  { _id: false },
);

const ConflictCheckSchema = new Schema<IConflictCheck>(
  {
    workspaceId: { type: Schema.Types.ObjectId, required: true, index: true },
    title: { type: String, trim: true, maxlength: 300 },
    partyNames: [{ type: String, trim: true, required: true }],
    partyIds: [{ type: Schema.Types.ObjectId, ref: 'Party' }],
    score: { type: Number, required: true, min: 0, max: 100 },
    risk: { type: String, enum: CONFLICT_RISKS, required: true, index: true },
    matches: { type: [ConflictMatchSchema], default: [] },
    status: { type: String, enum: CONFLICT_STATUSES, default: 'OPEN', index: true },
    caseId: { type: Schema.Types.ObjectId, ref: 'LegalCase', index: true },
    createdBy: { type: String, required: true, trim: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    optimisticConcurrency: true,
    collection: 'legal_conflict_checks',
  },
);

ConflictCheckSchema.index({ workspaceId: 1, createdAt: -1 });
ConflictCheckSchema.index({ workspaceId: 1, status: 1, risk: 1 });

export const ConflictCheck: Model<IConflictCheck> =
  mongoose.models.ConflictCheck ??
  mongoose.model<IConflictCheck>('ConflictCheck', ConflictCheckSchema);
