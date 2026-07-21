import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { softDeletePlugin } from '../../../common/soft-delete.plugin.js';

export const KNOWLEDGE_CATEGORIES = [
  'TEMPLATE',
  'ACT',
  'RULE',
  'CIRCULAR',
  'NOTIFICATION',
  'SOP',
  'DRAFT',
] as const;

export interface IKnowledgeDoc extends Document {
  workspaceId: mongoose.Types.ObjectId;
  title: string;
  category: (typeof KNOWLEDGE_CATEGORIES)[number];
  body: string;
  tags: string[];
  bookmarkedBy: mongoose.Types.ObjectId[];
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const KnowledgeSchema = new Schema<IKnowledgeDoc>(
  {
    workspaceId: { type: Schema.Types.ObjectId, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 300 },
    category: { type: String, enum: KNOWLEDGE_CATEGORIES, required: true, index: true },
    body: { type: String, required: true, maxlength: 200000 },
    tags: [{ type: String, trim: true }],
    bookmarkedBy: [{ type: Schema.Types.ObjectId }],
    createdBy: { type: Schema.Types.ObjectId },
    updatedBy: { type: Schema.Types.ObjectId },
  },
  { timestamps: true, optimisticConcurrency: true, collection: 'legal_knowledge_docs' },
);

KnowledgeSchema.plugin(softDeletePlugin);
KnowledgeSchema.index({ workspaceId: 1, category: 1, updatedAt: -1 });
KnowledgeSchema.index({ title: 'text', body: 'text', tags: 'text' });

export const KnowledgeDoc: Model<IKnowledgeDoc> =
  mongoose.models.LegalKnowledgeDoc ??
  mongoose.model<IKnowledgeDoc>('LegalKnowledgeDoc', KnowledgeSchema);
