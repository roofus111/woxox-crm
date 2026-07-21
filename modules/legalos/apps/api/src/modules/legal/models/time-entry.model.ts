import mongoose, { Schema, type Document, type Model } from 'mongoose';

export const TIME_ENTRY_ACTIVITIES = [
  'RESEARCH',
  'DRAFTING',
  'COURT',
  'TRAVEL',
  'CLIENT_MEETING',
  'PHONE',
  'VIDEO',
  'OTHER',
] as const;
export type TimeEntryActivity = (typeof TIME_ENTRY_ACTIVITIES)[number];

export interface ITimeEntry extends Document {
  workspaceId: mongoose.Types.ObjectId;
  caseId?: mongoose.Types.ObjectId;
  userId: string;
  activity: TimeEntryActivity;
  minutes: number;
  billable: boolean;
  notes?: string;
  occurredAt: Date;
  createdAt: Date;
}

const TimeEntrySchema = new Schema<ITimeEntry>(
  {
    workspaceId: { type: Schema.Types.ObjectId, required: true, index: true },
    caseId: { type: Schema.Types.ObjectId, ref: 'LegalCase', index: true },
    userId: { type: String, required: true, trim: true, index: true },
    activity: { type: String, enum: TIME_ENTRY_ACTIVITIES, required: true, index: true },
    minutes: { type: Number, required: true, min: 1 },
    billable: { type: Boolean, default: true },
    notes: { type: String, maxlength: 5000 },
    occurredAt: { type: Date, required: true, index: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    optimisticConcurrency: true,
    collection: 'legal_time_entries',
  },
);

TimeEntrySchema.index({ workspaceId: 1, userId: 1, occurredAt: -1 });
TimeEntrySchema.index({ workspaceId: 1, caseId: 1, occurredAt: -1 });

export const TimeEntry: Model<ITimeEntry> =
  mongoose.models.TimeEntry ?? mongoose.model<ITimeEntry>('TimeEntry', TimeEntrySchema);
