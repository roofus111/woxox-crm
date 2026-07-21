import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { softDeletePlugin } from '../../../common/soft-delete.plugin.js';
import { PARTY_TYPES } from '../enums.js';

export interface PartyContact {
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface PartyIdentityDocument {
  type: string;
  number: string;
  issuedAt?: Date;
  expiresAt?: Date;
}

export interface IParty extends Document {
  workspaceId: mongoose.Types.ObjectId;
  type: (typeof PARTY_TYPES)[number];
  displayName: string;
  firstName?: string;
  lastName?: string;
  organizationName?: string;
  designation?: string;
  contact?: PartyContact;
  identityDocuments?: PartyIdentityDocument[];
  notes?: string;
  tags?: string[];
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  deletedAt?: Date | null;
  deletedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const PartySchema = new Schema<IParty>(
  {
    workspaceId: { type: Schema.Types.ObjectId, required: true, index: true },
    type: { type: String, enum: PARTY_TYPES, required: true, index: true },
    displayName: { type: String, required: true, trim: true, maxlength: 300 },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    organizationName: { type: String, trim: true },
    designation: { type: String, trim: true },
    contact: {
      phone: String,
      email: String,
      address: String,
      city: String,
      state: String,
      pincode: String,
    },
    identityDocuments: [
      {
        type: { type: String, required: true },
        number: { type: String, required: true },
        issuedAt: Date,
        expiresAt: Date,
      },
    ],
    notes: { type: String, maxlength: 5000 },
    tags: [{ type: String, trim: true }],
    createdBy: { type: Schema.Types.ObjectId },
    updatedBy: { type: Schema.Types.ObjectId },
  },
  { timestamps: true, optimisticConcurrency: true, collection: 'legal_parties' },
);

PartySchema.plugin(softDeletePlugin);
PartySchema.index({ workspaceId: 1, type: 1, displayName: 1 });
PartySchema.index(
  { workspaceId: 1, 'contact.email': 1 },
  { sparse: true, partialFilterExpression: { deletedAt: null } },
);
PartySchema.index({ workspaceId: 1, displayName: 'text', organizationName: 'text' });

export const Party: Model<IParty> =
  mongoose.models.Party ?? mongoose.model<IParty>('Party', PartySchema);
