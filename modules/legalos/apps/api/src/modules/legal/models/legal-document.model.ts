import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { softDeletePlugin } from '../../../common/soft-delete.plugin.js';

export const LEGAL_DOCUMENT_TYPES = [
  'PETITION',
  'AFFIDAVIT',
  'NOTICE',
  'REPLY',
  'ORDER',
  'JUDGMENT',
  'CONTRACT',
  'OPINION',
  'OTHER',
] as const;

export interface ILegalDocument extends Document {
  workspaceId: mongoose.Types.ObjectId;
  title: string;
  type: (typeof LEGAL_DOCUMENT_TYPES)[number];
  caseId?: mongoose.Types.ObjectId;
  evidenceId?: mongoose.Types.ObjectId;
  templateId?: string;
  version: number;
  storageKey?: string;
  checksum?: string;
  mimeType?: string;
  sizeBytes?: number;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  deletedAt?: Date | null;
  deletedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const LegalDocumentSchema = new Schema<ILegalDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 300 },
    type: { type: String, enum: LEGAL_DOCUMENT_TYPES, required: true, index: true },
    caseId: { type: Schema.Types.ObjectId, ref: 'LegalCase', index: true },
    evidenceId: { type: Schema.Types.ObjectId, ref: 'Evidence' },
    templateId: String,
    version: { type: Number, default: 1 },
    storageKey: String,
    checksum: { type: String, index: true },
    mimeType: String,
    sizeBytes: Number,
    createdBy: { type: Schema.Types.ObjectId },
    updatedBy: { type: Schema.Types.ObjectId },
  },
  { timestamps: true, optimisticConcurrency: true, collection: 'legal_documents' },
);

LegalDocumentSchema.plugin(softDeletePlugin);
LegalDocumentSchema.index({ workspaceId: 1, caseId: 1, type: 1, createdAt: -1 });
LegalDocumentSchema.index({ workspaceId: 1, checksum: 1 }, { sparse: true });

export const LegalDocument: Model<ILegalDocument> =
  mongoose.models.LegalDocument ??
  mongoose.model<ILegalDocument>('LegalDocument', LegalDocumentSchema);
