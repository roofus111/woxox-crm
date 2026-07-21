import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IBranch extends Document {
  workspaceId: mongoose.Types.ObjectId;
  name: string;
  code: string;
  city?: string;
  state?: string;
  isHeadOffice: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BranchSchema = new Schema<IBranch>(
  {
    workspaceId: { type: Schema.Types.ObjectId, required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    code: { type: String, required: true, trim: true, uppercase: true, maxlength: 32 },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    isHeadOffice: { type: Boolean, default: false },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, optimisticConcurrency: true, collection: 'legal_branches' },
);

BranchSchema.index({ workspaceId: 1, code: 1 }, { unique: true });
BranchSchema.index({ workspaceId: 1, active: 1, name: 1 });

export const Branch: Model<IBranch> =
  mongoose.models.Branch ?? mongoose.model<IBranch>('Branch', BranchSchema);
