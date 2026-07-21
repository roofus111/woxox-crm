import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { softDeletePlugin } from '../../../common/soft-delete.plugin.js';
import { HEARING_STATUSES } from '../enums.js';

export interface HearingCourtSnapshot {
  name?: string;
  courtNumber?: string;
  judgeName?: string;
  bench?: string;
}

export interface IHearing extends Document {
  workspaceId: mongoose.Types.ObjectId;
  caseId: mongoose.Types.ObjectId;
  title: string;
  scheduledAt: Date;
  status: (typeof HEARING_STATUSES)[number];
  court: HearingCourtSnapshot;
  assignedAdvocateIds: mongoose.Types.ObjectId[];
  purpose?: string;
  notes?: string;
  reminderSentAt?: Date;
  completedAt?: Date;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  deletedAt?: Date | null;
  deletedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const HearingSchema = new Schema<IHearing>(
  {
    workspaceId: { type: Schema.Types.ObjectId, required: true, index: true },
    caseId: { type: Schema.Types.ObjectId, ref: 'LegalCase', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 300 },
    scheduledAt: { type: Date, required: true, index: true },
    status: { type: String, enum: HEARING_STATUSES, default: 'SCHEDULED', index: true },
    court: {
      name: String,
      courtNumber: String,
      judgeName: String,
      bench: String,
    },
    assignedAdvocateIds: [{ type: Schema.Types.ObjectId }],
    purpose: { type: String, trim: true },
    notes: { type: String, maxlength: 5000 },
    reminderSentAt: Date,
    completedAt: Date,
    createdBy: { type: Schema.Types.ObjectId },
    updatedBy: { type: Schema.Types.ObjectId },
  },
  { timestamps: true, optimisticConcurrency: true, collection: 'legal_hearings' },
);

HearingSchema.plugin(softDeletePlugin);
HearingSchema.index({ workspaceId: 1, scheduledAt: 1, status: 1 });
HearingSchema.index({ workspaceId: 1, caseId: 1, scheduledAt: 1 });

export const Hearing: Model<IHearing> =
  mongoose.models.Hearing ?? mongoose.model<IHearing>('Hearing', HearingSchema);
