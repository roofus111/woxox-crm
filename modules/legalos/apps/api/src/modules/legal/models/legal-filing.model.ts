import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { softDeletePlugin } from '../../../common/soft-delete.plugin.js';
import { FILING_STATUSES, FILING_TYPES } from '../enums.js';

export interface FilingChecklistItem {
  label: string;
  completed: boolean;
  completedAt?: Date;
  completedBy?: mongoose.Types.ObjectId;
}

export interface FilingDefect {
  description: string;
  raisedAt: Date;
  resolvedAt?: Date;
  notes?: string;
}

export interface FilingRegistryObjection {
  description: string;
  raisedAt: Date;
  resolvedAt?: Date;
  notes?: string;
}

export interface ILegalFiling extends Document {
  workspaceId: mongoose.Types.ObjectId;
  caseId: mongoose.Types.ObjectId;
  title: string;
  filingType: (typeof FILING_TYPES)[number];
  status: (typeof FILING_STATUSES)[number];
  checklist: FilingChecklistItem[];
  courtFees?: number;
  stampDuty?: number;
  diaryNumber?: string;
  defects: FilingDefect[];
  registryObjections: FilingRegistryObjection[];
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  deletedAt?: Date | null;
  deletedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const LegalFilingSchema = new Schema<ILegalFiling>(
  {
    workspaceId: { type: Schema.Types.ObjectId, required: true, index: true },
    caseId: { type: Schema.Types.ObjectId, ref: 'LegalCase', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 300 },
    filingType: { type: String, enum: FILING_TYPES, required: true, index: true },
    status: { type: String, enum: FILING_STATUSES, default: 'DRAFT', index: true },
    checklist: [
      {
        label: { type: String, required: true, trim: true },
        completed: { type: Boolean, default: false },
        completedAt: Date,
        completedBy: { type: Schema.Types.ObjectId },
      },
    ],
    courtFees: { type: Number, min: 0 },
    stampDuty: { type: Number, min: 0 },
    diaryNumber: { type: String, trim: true },
    defects: [
      {
        description: { type: String, required: true, trim: true },
        raisedAt: { type: Date, required: true },
        resolvedAt: Date,
        notes: { type: String, maxlength: 2000 },
      },
    ],
    registryObjections: [
      {
        description: { type: String, required: true, trim: true },
        raisedAt: { type: Date, required: true },
        resolvedAt: Date,
        notes: { type: String, maxlength: 2000 },
      },
    ],
    createdBy: { type: Schema.Types.ObjectId },
    updatedBy: { type: Schema.Types.ObjectId },
  },
  { timestamps: true, optimisticConcurrency: true, collection: 'legal_filings' },
);

LegalFilingSchema.plugin(softDeletePlugin);
LegalFilingSchema.index({ workspaceId: 1, caseId: 1, createdAt: -1 });
LegalFilingSchema.index({ workspaceId: 1, status: 1, createdAt: -1 });

export const LegalFiling: Model<ILegalFiling> =
  mongoose.models.LegalFiling ??
  mongoose.model<ILegalFiling>('LegalFiling', LegalFilingSchema);
