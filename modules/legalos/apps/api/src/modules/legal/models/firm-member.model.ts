import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { ACCESS_LEVELS, FIRM_DEPARTMENTS, FIRM_TITLES } from '../enums.js';

export interface ModuleAccessEntry {
  module: string;
  levels: (typeof ACCESS_LEVELS)[number][];
}

export interface IFirmMember extends Document {
  workspaceId: mongoose.Types.ObjectId;
  userId: string;
  branchId?: mongoose.Types.ObjectId;
  title: (typeof FIRM_TITLES)[number];
  department: (typeof FIRM_DEPARTMENTS)[number];
  accessLevels: (typeof ACCESS_LEVELS)[number][];
  moduleAccess: ModuleAccessEntry[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ModuleAccessSchema = new Schema<ModuleAccessEntry>(
  {
    module: { type: String, required: true, trim: true },
    levels: [{ type: String, enum: ACCESS_LEVELS }],
  },
  { _id: false },
);

const FirmMemberSchema = new Schema<IFirmMember>(
  {
    workspaceId: { type: Schema.Types.ObjectId, required: true, index: true },
    userId: { type: String, required: true, trim: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', index: true },
    title: { type: String, enum: FIRM_TITLES, required: true },
    department: { type: String, enum: FIRM_DEPARTMENTS, required: true, index: true },
    accessLevels: [{ type: String, enum: ACCESS_LEVELS }],
    moduleAccess: { type: [ModuleAccessSchema], default: [] },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, optimisticConcurrency: true, collection: 'legal_firm_members' },
);

FirmMemberSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });
FirmMemberSchema.index({ workspaceId: 1, branchId: 1, active: 1 });

export const FirmMember: Model<IFirmMember> =
  mongoose.models.FirmMember ?? mongoose.model<IFirmMember>('FirmMember', FirmMemberSchema);
