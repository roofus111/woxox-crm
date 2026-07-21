import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { softDeletePlugin } from '../../../common/soft-delete.plugin.js';
import { CASE_STATUSES, PRACTICE_AREAS } from '../enums.js';

export interface CourtSnapshot {
  cino?: string;
  name?: string;
  state?: string;
  district?: string;
  courtNumber?: string;
  judgeName?: string;
}

export interface ProviderRef {
  provider: string;
  externalKey: string;
  lastSyncedAt?: Date;
}

export interface ILegalCase extends Document {
  workspaceId: mongoose.Types.ObjectId;
  title: string;
  caseNumber?: string;
  status: (typeof CASE_STATUSES)[number];
  visibility: 'RESTRICTED' | 'BRANCH' | 'FIRM';
  branchId?: mongoose.Types.ObjectId;
  court: CourtSnapshot;
  clientPartyIds: mongoose.Types.ObjectId[];
  oppositePartyIds: mongoose.Types.ObjectId[];
  witnessPartyIds: mongoose.Types.ObjectId[];
  advocateIds: mongoose.Types.ObjectId[];
  practiceArea: (typeof PRACTICE_AREAS)[number];
  nextHearingAt?: Date;
  openedAt?: Date;
  closedAt?: Date;
  complaintIds: mongoose.Types.ObjectId[];
  firIds: mongoose.Types.ObjectId[];
  hearingIds: mongoose.Types.ObjectId[];
  providerRefs: ProviderRef[];
  partiesSearch?: string;
  summary?: string;
  tags?: string[];
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  deletedAt?: Date | null;
  deletedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const LegalCaseSchema = new Schema<ILegalCase>(
  {
    workspaceId: { type: Schema.Types.ObjectId, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 300 },
    caseNumber: { type: String, trim: true },
    status: { type: String, enum: CASE_STATUSES, default: 'ACTIVE', index: true },
    visibility: {
      type: String,
      enum: ['RESTRICTED', 'BRANCH', 'FIRM'],
      default: 'RESTRICTED',
      index: true,
    },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', index: true },
    court: {
      cino: String,
      name: String,
      state: String,
      district: String,
      courtNumber: String,
      judgeName: String,
    },
    clientPartyIds: [{ type: Schema.Types.ObjectId, ref: 'Party' }],
    oppositePartyIds: [{ type: Schema.Types.ObjectId, ref: 'Party' }],
    witnessPartyIds: [{ type: Schema.Types.ObjectId, ref: 'Party' }],
    advocateIds: [{ type: Schema.Types.ObjectId }],
    practiceArea: { type: String, enum: PRACTICE_AREAS, required: true, index: true },
    nextHearingAt: { type: Date, index: true },
    openedAt: { type: Date },
    closedAt: { type: Date },
    complaintIds: [{ type: Schema.Types.ObjectId, ref: 'Complaint' }],
    firIds: [{ type: Schema.Types.ObjectId, ref: 'Fir' }],
    hearingIds: [{ type: Schema.Types.ObjectId, ref: 'Hearing' }],
    providerRefs: [
      {
        provider: String,
        externalKey: String,
        lastSyncedAt: Date,
      },
    ],
    partiesSearch: { type: String },
    summary: { type: String, maxlength: 10000 },
    tags: [{ type: String, trim: true }],
    createdBy: { type: Schema.Types.ObjectId },
    updatedBy: { type: Schema.Types.ObjectId },
  },
  { timestamps: true, optimisticConcurrency: true, collection: 'legal_cases' },
);

LegalCaseSchema.plugin(softDeletePlugin);
LegalCaseSchema.index({ workspaceId: 1, status: 1, nextHearingAt: 1 });
LegalCaseSchema.index({ workspaceId: 1, visibility: 1, deletedAt: 1 });
LegalCaseSchema.index({ workspaceId: 1, createdBy: 1 });
LegalCaseSchema.index({ workspaceId: 1, branchId: 1, deletedAt: 1 });
LegalCaseSchema.index({ workspaceId: 1, 'court.cino': 1 }, { sparse: true });
LegalCaseSchema.index(
  { workspaceId: 1, caseNumber: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { deletedAt: null, caseNumber: { $type: 'string' } },
  },
);
LegalCaseSchema.index({ title: 'text', caseNumber: 'text', partiesSearch: 'text' });

export const LegalCase: Model<ILegalCase> =
  mongoose.models.LegalCase ?? mongoose.model<ILegalCase>('LegalCase', LegalCaseSchema);
