import mongoose, { Schema, type Document, type Model } from 'mongoose';

export const DOCUMENT_WORKFLOW_STEPS = [
  'INTERN',
  'JUNIOR',
  'SENIOR',
  'PARTNER',
  'CLIENT',
  'FILING',
  'DONE',
] as const;
export type DocumentWorkflowStep = (typeof DOCUMENT_WORKFLOW_STEPS)[number];

export interface DocumentWorkflowVersion {
  version: number;
  body: string;
  authorId: string;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
}

export interface IDocumentWorkflow extends Document {
  workspaceId: mongoose.Types.ObjectId;
  caseId: mongoose.Types.ObjectId;
  title: string;
  currentStep: DocumentWorkflowStep;
  versions: DocumentWorkflowVersion[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentWorkflowVersionSchema = new Schema<DocumentWorkflowVersion>(
  {
    version: { type: Number, required: true, min: 1 },
    body: { type: String, required: true },
    authorId: { type: String, required: true, trim: true },
    approvedBy: { type: String, trim: true },
    approvedAt: { type: Date },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false },
);

const DocumentWorkflowSchema = new Schema<IDocumentWorkflow>(
  {
    workspaceId: { type: Schema.Types.ObjectId, required: true, index: true },
    caseId: { type: Schema.Types.ObjectId, ref: 'LegalCase', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 300 },
    currentStep: {
      type: String,
      enum: DOCUMENT_WORKFLOW_STEPS,
      default: 'INTERN',
      index: true,
    },
    versions: { type: [DocumentWorkflowVersionSchema], default: [] },
    createdBy: { type: String, required: true, trim: true },
  },
  { timestamps: true, optimisticConcurrency: true, collection: 'legal_document_workflows' },
);

DocumentWorkflowSchema.index({ workspaceId: 1, caseId: 1, currentStep: 1 });
DocumentWorkflowSchema.index({ workspaceId: 1, createdAt: -1 });

export const DocumentWorkflow: Model<IDocumentWorkflow> =
  mongoose.models.DocumentWorkflow ??
  mongoose.model<IDocumentWorkflow>('DocumentWorkflow', DocumentWorkflowSchema);
