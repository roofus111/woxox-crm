import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { ACCESS_LEVELS } from '../enums.js';

export interface ICaseAcl extends Document {
  workspaceId: mongoose.Types.ObjectId;
  caseId: mongoose.Types.ObjectId;
  userId: string;
  levels: (typeof ACCESS_LEVELS)[number][];
  grantedBy: string;
  createdAt: Date;
}

const CaseAclSchema = new Schema<ICaseAcl>(
  {
    workspaceId: { type: Schema.Types.ObjectId, required: true, index: true },
    caseId: { type: Schema.Types.ObjectId, ref: 'LegalCase', required: true, index: true },
    userId: { type: String, required: true, trim: true, index: true },
    levels: [{ type: String, enum: ACCESS_LEVELS, required: true }],
    grantedBy: { type: String, required: true, trim: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    optimisticConcurrency: true,
    collection: 'legal_case_acl',
  },
);

CaseAclSchema.index({ workspaceId: 1, caseId: 1, userId: 1 }, { unique: true });
CaseAclSchema.index({ workspaceId: 1, userId: 1 });

export const CaseAcl: Model<ICaseAcl> =
  mongoose.models.CaseAcl ?? mongoose.model<ICaseAcl>('CaseAcl', CaseAclSchema);
