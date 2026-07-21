import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { MATTER_TEAM_ROLES } from '../enums.js';

export interface IMatterTeamMember extends Document {
  workspaceId: mongoose.Types.ObjectId;
  caseId: mongoose.Types.ObjectId;
  userId: string;
  role: (typeof MATTER_TEAM_ROLES)[number];
  responsibilities?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MatterTeamSchema = new Schema<IMatterTeamMember>(
  {
    workspaceId: { type: Schema.Types.ObjectId, required: true, index: true },
    caseId: { type: Schema.Types.ObjectId, ref: 'LegalCase', required: true, index: true },
    userId: { type: String, required: true, trim: true, index: true },
    role: { type: String, enum: MATTER_TEAM_ROLES, required: true },
    responsibilities: { type: String, trim: true, maxlength: 2000 },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, optimisticConcurrency: true, collection: 'legal_matter_team' },
);

MatterTeamSchema.index({ workspaceId: 1, caseId: 1, userId: 1, role: 1 }, { unique: true });
MatterTeamSchema.index({ workspaceId: 1, userId: 1, active: 1 });

export const MatterTeamMember: Model<IMatterTeamMember> =
  mongoose.models.MatterTeamMember ??
  mongoose.model<IMatterTeamMember>('MatterTeamMember', MatterTeamSchema);
