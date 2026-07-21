import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { softDeletePlugin } from '../../../common/soft-delete.plugin.js';
import { BAIL_STATUSES, FIR_STATUSES } from '../enums.js';

export interface ActSectionRef {
  act: string;
  sections: string[];
}

export interface FirChargeSheet {
  filedAt?: Date;
  referenceNumber?: string;
  notes?: string;
}

export interface FirClosureReport {
  reportedAt?: Date;
  type?: string;
  notes?: string;
}

export interface FirCourtTransfer {
  transferredAt?: Date;
  courtName?: string;
  caseNumber?: string;
  notes?: string;
}

export interface IFir extends Document {
  workspaceId: mongoose.Types.ObjectId;
  firNumber: string;
  policeStation: string;
  policeStationKey: string;
  status: (typeof FIR_STATUSES)[number];
  bailStatus: (typeof BAIL_STATUSES)[number];
  registeredAt?: Date;
  actsAndSections: ActSectionRef[];
  clientPartyId?: mongoose.Types.ObjectId;
  accusedPartyIds: mongoose.Types.ObjectId[];
  victimPartyIds: mongoose.Types.ObjectId[];
  officerPartyId?: mongoose.Types.ObjectId;
  investigationOfficer?: string;
  linkedCaseId?: mongoose.Types.ObjectId;
  sourceComplaintId?: mongoose.Types.ObjectId;
  chargeSheetFiledAt?: Date;
  closureReportAt?: Date;
  chargeSheet?: FirChargeSheet;
  closureReport?: FirClosureReport;
  courtTransfer?: FirCourtTransfer;
  summary?: string;
  tags?: string[];
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  deletedAt?: Date | null;
  deletedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const FirSchema = new Schema<IFir>(
  {
    workspaceId: { type: Schema.Types.ObjectId, required: true, index: true },
    firNumber: { type: String, required: true, trim: true },
    policeStation: { type: String, required: true, trim: true },
    policeStationKey: { type: String, required: true, trim: true, index: true },
    status: { type: String, enum: FIR_STATUSES, default: 'REGISTERED', index: true },
    bailStatus: { type: String, enum: BAIL_STATUSES, default: 'NOT_APPLICABLE', index: true },
    registeredAt: { type: Date, index: true },
    actsAndSections: [
      {
        act: { type: String, required: true },
        sections: [{ type: String }],
      },
    ],
    clientPartyId: { type: Schema.Types.ObjectId, ref: 'Party' },
    accusedPartyIds: [{ type: Schema.Types.ObjectId, ref: 'Party' }],
    victimPartyIds: [{ type: Schema.Types.ObjectId, ref: 'Party' }],
    officerPartyId: { type: Schema.Types.ObjectId, ref: 'Party' },
    investigationOfficer: { type: String, trim: true },
    linkedCaseId: { type: Schema.Types.ObjectId, ref: 'LegalCase' },
    sourceComplaintId: { type: Schema.Types.ObjectId, ref: 'Complaint' },
    chargeSheetFiledAt: Date,
    closureReportAt: Date,
    chargeSheet: {
      filedAt: Date,
      referenceNumber: { type: String, trim: true },
      notes: { type: String, maxlength: 5000 },
    },
    closureReport: {
      reportedAt: Date,
      type: { type: String, trim: true },
      notes: { type: String, maxlength: 5000 },
    },
    courtTransfer: {
      transferredAt: Date,
      courtName: { type: String, trim: true },
      caseNumber: { type: String, trim: true },
      notes: { type: String, maxlength: 5000 },
    },
    summary: { type: String, maxlength: 10000 },
    tags: [{ type: String, trim: true }],
    createdBy: { type: Schema.Types.ObjectId },
    updatedBy: { type: Schema.Types.ObjectId },
  },
  { timestamps: true, optimisticConcurrency: true, collection: 'legal_firs' },
);

FirSchema.plugin(softDeletePlugin);
FirSchema.index(
  { workspaceId: 1, firNumber: 1, policeStationKey: 1 },
  { unique: true, sparse: true, partialFilterExpression: { deletedAt: null } },
);
FirSchema.index({ workspaceId: 1, bailStatus: 1 });
FirSchema.index({ workspaceId: 1, status: 1, registeredAt: -1 });

export const Fir: Model<IFir> =
  mongoose.models.Fir ?? mongoose.model<IFir>('Fir', FirSchema);
