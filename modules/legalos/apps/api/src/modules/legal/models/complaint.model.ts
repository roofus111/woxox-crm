import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { softDeletePlugin } from '../../../common/soft-delete.plugin.js';
import { COMPLAINT_CATEGORIES, COMPLAINT_STATUSES } from '../enums.js';

export interface IComplaint extends Document {
  workspaceId: mongoose.Types.ObjectId;
  complaintNumber: string;
  status: (typeof COMPLAINT_STATUSES)[number];
  category: (typeof COMPLAINT_CATEGORIES)[number];
  policeStation?: string;
  policeStationKey?: string;
  clientPartyId?: mongoose.Types.ObjectId;
  oppositePartyIds: mongoose.Types.ObjectId[];
  witnessPartyIds: mongoose.Types.ObjectId[];
  incidentDate?: Date;
  location?: string;
  description?: string;
  investigationStatus?: string;
  nextFollowUpAt?: Date;
  convertedFirId?: mongoose.Types.ObjectId;
  linkedCaseId?: mongoose.Types.ObjectId;
  convertedAt?: Date;
  convertedBy?: mongoose.Types.ObjectId;
  notes?: string;
  tags?: string[];
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  deletedAt?: Date | null;
  deletedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    workspaceId: { type: Schema.Types.ObjectId, required: true, index: true },
    complaintNumber: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: COMPLAINT_STATUSES,
      default: 'REGISTERED',
      index: true,
    },
    category: { type: String, enum: COMPLAINT_CATEGORIES, required: true, index: true },
    policeStation: { type: String, trim: true },
    policeStationKey: { type: String, trim: true, index: true },
    clientPartyId: { type: Schema.Types.ObjectId, ref: 'Party' },
    oppositePartyIds: [{ type: Schema.Types.ObjectId, ref: 'Party' }],
    witnessPartyIds: [{ type: Schema.Types.ObjectId, ref: 'Party' }],
    incidentDate: { type: Date, index: true },
    location: { type: String, trim: true },
    description: { type: String, maxlength: 10000 },
    investigationStatus: { type: String, trim: true },
    nextFollowUpAt: { type: Date, index: true },
    convertedFirId: { type: Schema.Types.ObjectId, ref: 'Fir' },
    linkedCaseId: { type: Schema.Types.ObjectId, ref: 'LegalCase' },
    convertedAt: Date,
    convertedBy: { type: Schema.Types.ObjectId },
    notes: { type: String, maxlength: 10000 },
    tags: [{ type: String, trim: true }],
    createdBy: { type: Schema.Types.ObjectId },
    updatedBy: { type: Schema.Types.ObjectId },
  },
  { timestamps: true, optimisticConcurrency: true, collection: 'legal_complaints' },
);

ComplaintSchema.plugin(softDeletePlugin);
ComplaintSchema.index(
  { workspaceId: 1, complaintNumber: 1 },
  { unique: true, sparse: true, partialFilterExpression: { deletedAt: null } },
);
ComplaintSchema.index({ workspaceId: 1, status: 1, nextFollowUpAt: 1 });
ComplaintSchema.index({ workspaceId: 1, category: 1, incidentDate: -1 });

export const Complaint: Model<IComplaint> =
  mongoose.models.Complaint ?? mongoose.model<IComplaint>('Complaint', ComplaintSchema);
