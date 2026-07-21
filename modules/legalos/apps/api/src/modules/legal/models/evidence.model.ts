import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { softDeletePlugin } from '../../../common/soft-delete.plugin.js';
import { EVIDENCE_MEDIA_TYPES, EVIDENCE_STATUSES } from '../enums.js';

export interface CustodyEvent {
  eventId: string;
  action: 'REGISTERED' | 'UPLOADED' | 'VERIFIED' | 'ACCESSED' | 'SEALED' | 'TRANSFERRED';
  actorId: string;
  occurredAt: Date;
  sha256?: string;
  storageKey?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface IEvidence extends Document {
  workspaceId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  mediaType: (typeof EVIDENCE_MEDIA_TYPES)[number];
  status: (typeof EVIDENCE_STATUSES)[number];
  caseId?: mongoose.Types.ObjectId;
  complaintId?: mongoose.Types.ObjectId;
  firId?: mongoose.Types.ObjectId;
  mimeType?: string;
  sizeBytes?: number;
  storageKey?: string;
  sha256?: string;
  hashAlgorithm: string;
  occurredAt?: Date;
  receivedAt?: Date;
  sealedAt?: Date;
  sealedBy?: mongoose.Types.ObjectId;
  tags?: string[];
  custodyEvents: CustodyEvent[];
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  deletedAt?: Date | null;
  deletedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const CustodyEventSchema = new Schema<CustodyEvent>(
  {
    eventId: { type: String, required: true },
    action: {
      type: String,
      enum: ['REGISTERED', 'UPLOADED', 'VERIFIED', 'ACCESSED', 'SEALED', 'TRANSFERRED'],
      required: true,
    },
    actorId: { type: String, required: true },
    occurredAt: { type: Date, required: true, default: Date.now },
    sha256: String,
    storageKey: String,
    notes: String,
    metadata: Schema.Types.Mixed,
  },
  { _id: false },
);

const EvidenceSchema = new Schema<IEvidence>(
  {
    workspaceId: { type: Schema.Types.ObjectId, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 300 },
    description: { type: String, maxlength: 5000 },
    mediaType: { type: String, enum: EVIDENCE_MEDIA_TYPES, required: true, index: true },
    status: { type: String, enum: EVIDENCE_STATUSES, default: 'PENDING_UPLOAD', index: true },
    caseId: { type: Schema.Types.ObjectId, ref: 'LegalCase', index: true },
    complaintId: { type: Schema.Types.ObjectId, ref: 'Complaint', index: true },
    firId: { type: Schema.Types.ObjectId, ref: 'Fir', index: true },
    mimeType: String,
    sizeBytes: Number,
    storageKey: { type: String, index: true },
    sha256: { type: String, index: true },
    hashAlgorithm: { type: String, default: 'sha256' },
    occurredAt: { type: Date, index: true },
    receivedAt: Date,
    sealedAt: Date,
    sealedBy: { type: Schema.Types.ObjectId },
    tags: [{ type: String, trim: true }],
    custodyEvents: { type: [CustodyEventSchema], default: [] },
    createdBy: { type: Schema.Types.ObjectId },
    updatedBy: { type: Schema.Types.ObjectId },
  },
  { timestamps: true, optimisticConcurrency: true, collection: 'legal_evidence' },
);

EvidenceSchema.plugin(softDeletePlugin);
EvidenceSchema.index({ workspaceId: 1, sha256: 1 }, { sparse: true });
EvidenceSchema.index({ workspaceId: 1, caseId: 1, occurredAt: -1 });
EvidenceSchema.index({ workspaceId: 1, status: 1, createdAt: -1 });

export const Evidence: Model<IEvidence> =
  mongoose.models.Evidence ?? mongoose.model<IEvidence>('Evidence', EvidenceSchema);
