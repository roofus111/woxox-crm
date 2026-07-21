import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface ILegalUser extends Document {
  email: string;
  name: string;
  passwordHash: string;
  roles: string[];
  workspaceIds: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LegalUserSchema = new Schema<ILegalUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    roles: { type: [String], default: ['legal-admin', 'advocate'] },
    workspaceIds: { type: [String], default: ['000000000000000000000001'] },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'legal_users' },
);

export const LegalUser: Model<ILegalUser> =
  mongoose.models.LegalUser ?? mongoose.model<ILegalUser>('LegalUser', LegalUserSchema);
