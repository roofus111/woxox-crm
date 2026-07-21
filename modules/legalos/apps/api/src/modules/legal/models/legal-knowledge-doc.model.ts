import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { softDeletePlugin } from '../../../common/soft-delete.plugin.js';
import { KNOWLEDGE_CATEGORIES } from '../enums.js';

export interface ILegalKnowledgeDoc extends Document {
  workspaceId: mongoose.Types.ObjectId;
  title: string;
  category: (typeof KNOWLEDGE_CATEGORIES)[number];
  body: string;
  tags: string[];
  bookmarks: mongoose.Types.ObjectId[];
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  deletedAt?: Date | null;
  deletedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const LegalKnowledgeDocSchema = new Schema<ILegalKnowledgeDoc>(
  {
    workspaceId: { type: Schema.Types.ObjectId, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 300 },
    category: { type: String, enum: KNOWLEDGE_CATEGORIES, required: true, index: true },
    body: { type: String, required: true, maxlength: 500000 },
    tags: [{ type: String, trim: true }],
    bookmarks: [{ type: Schema.Types.ObjectId }],
    createdBy: { type: Schema.Types.ObjectId },
    updatedBy: { type: Schema.Types.ObjectId },
  },
  { timestamps: true, optimisticConcurrency: true, collection: 'legal_knowledge_docs' },
);

LegalKnowledgeDocSchema.plugin(softDeletePlugin);
LegalKnowledgeDocSchema.index({ workspaceId: 1, category: 1, createdAt: -1 });
LegalKnowledgeDocSchema.index({ workspaceId: 1, title: 'text', body: 'text' });

export const LegalKnowledgeDoc: Model<ILegalKnowledgeDoc> =
  mongoose.models.LegalKnowledgeDoc ??
  mongoose.model<ILegalKnowledgeDoc>('LegalKnowledgeDoc', LegalKnowledgeDocSchema);
