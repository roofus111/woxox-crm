import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { softDeletePlugin } from '../../../common/soft-delete.plugin.js';

export const FILING_STATUSES = [
  'DRAFT',
  'CHECKLIST',
  'FILED',
  'DEFECT',
  'REFILED',
  'REGISTERED',
] as const;

export interface IFiling extends Document {
  workspaceId: mongoose.Types.ObjectId;
  caseId: mongoose.Types.ObjectId;
  title: string;
  filingType: string;
  status: (typeof FILING_STATUSES)[number];
  checklist: Array<{ item: string; done: boolean }>;
  courtFees?: number;
  stampDuty?: number;
  diaryNumber?: string;
  defects: Array<{ note: string; raisedAt: Date; resolvedAt?: Date }>;
  registryObjections: Array<{ note: string; raisedAt: Date }>;
  notes?: string;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const FilingSchema = new Schema<IFiling>(
  {
    workspaceId: { type: Schema.Types.ObjectId, required: true, index: true },
    caseId: { type: Schema.Types.ObjectId, ref: 'LegalCase', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 300 },
    filingType: { type: String, required: true, trim: true },
    status: { type: String, enum: FILING_STATUSES, default: 'DRAFT', index: true },
    checklist: [
      {
        item: { type: String, required: true },
        done: { type: Boolean, default: false },
      },
    ],
    courtFees: Number,
    stampDuty: Number,
    diaryNumber: { type: String, trim: true },
    defects: [
      {
        note: String,
        raisedAt: { type: Date, default: Date.now },
        resolvedAt: Date,
      },
    ],
    registryObjections: [
      {
        note: String,
        raisedAt: { type: Date, default: Date.now },
      },
    ],
    notes: { type: String, maxlength: 5000 },
    createdBy: { type: Schema.Types.ObjectId },
    updatedBy: { type: Schema.Types.ObjectId },
  },
  { timestamps: true, optimisticConcurrency: true, collection: 'legal_filings' },
);

FilingSchema.plugin(softDeletePlugin);
FilingSchema.index({ workspaceId: 1, caseId: 1, createdAt: -1 });

export const Filing: Model<IFiling> =
  mongoose.models.LegalFiling ?? mongoose.model<IFiling>('LegalFiling', FilingSchema);
