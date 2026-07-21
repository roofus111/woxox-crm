import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { LEGAL_NOTIFICATION_TYPES } from '../enums.js';

export interface ILegalNotification extends Document {
  workspaceId: mongoose.Types.ObjectId;
  type: (typeof LEGAL_NOTIFICATION_TYPES)[number];
  title: string;
  body: string;
  entityType?: string;
  entityId?: string;
  userId?: mongoose.Types.ObjectId;
  readAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLegalNotificationInput {
  workspaceId: string;
  type: (typeof LEGAL_NOTIFICATION_TYPES)[number];
  title: string;
  body: string;
  entityType?: string;
  entityId?: string;
  userId?: string;
}

const LegalNotificationSchema = new Schema<ILegalNotification>(
  {
    workspaceId: { type: Schema.Types.ObjectId, required: true, index: true },
    type: { type: String, enum: LEGAL_NOTIFICATION_TYPES, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 300 },
    body: { type: String, required: true, maxlength: 5000 },
    entityType: { type: String, trim: true, index: true },
    entityId: { type: String, trim: true, index: true },
    userId: { type: Schema.Types.ObjectId, index: true },
    readAt: { type: Date, default: null, index: true },
  },
  { timestamps: true, collection: 'legal_notifications' },
);

LegalNotificationSchema.index({ workspaceId: 1, createdAt: -1 });
LegalNotificationSchema.index({ workspaceId: 1, userId: 1, readAt: 1, createdAt: -1 });

export const LegalNotification: Model<ILegalNotification> =
  mongoose.models.LegalNotification ??
  mongoose.model<ILegalNotification>('LegalNotification', LegalNotificationSchema);

export async function createLegalNotification(
  input: CreateLegalNotificationInput,
): Promise<ILegalNotification> {
  return LegalNotification.create({
    workspaceId: new mongoose.Types.ObjectId(input.workspaceId),
    type: input.type,
    title: input.title,
    body: input.body,
    entityType: input.entityType,
    entityId: input.entityId,
    userId: input.userId ? new mongoose.Types.ObjectId(input.userId) : undefined,
  });
}

/** Alias used by hearings and other domain services */
export async function pushLegalNotification(input: {
  workspaceId: string;
  userId?: string;
  type: string;
  title: string;
  body?: string;
  entityType?: string;
  entityId?: string;
}): Promise<ILegalNotification> {
  const allowed = LEGAL_NOTIFICATION_TYPES as readonly string[];
  const type = (allowed.includes(input.type) ? input.type : 'GENERAL') as CreateLegalNotificationInput['type'];
  return createLegalNotification({
    workspaceId: input.workspaceId,
    type,
    title: input.title,
    body: input.body ?? '',
    entityType: input.entityType,
    entityId: input.entityId,
    userId: input.userId,
  });
}

export async function createHearingScheduledNotification(input: {
  workspaceId: string;
  hearingId: string;
  caseId: string;
  title: string;
  scheduledAt: Date;
  userId?: string;
}): Promise<ILegalNotification> {
  return createLegalNotification({
    workspaceId: input.workspaceId,
    type: 'HEARING_SCHEDULED',
    title: 'Hearing scheduled',
    body: `"${input.title}" scheduled for ${input.scheduledAt.toISOString()}`,
    entityType: 'Hearing',
    entityId: input.hearingId,
    userId: input.userId,
  });
}

export async function createComplaintFollowUpNotification(input: {
  workspaceId: string;
  complaintId: string;
  complaintNumber: string;
  nextFollowUpAt: Date;
  userId?: string;
}): Promise<ILegalNotification> {
  return createLegalNotification({
    workspaceId: input.workspaceId,
    type: 'COMPLAINT_FOLLOW_UP_DUE',
    title: 'Complaint follow-up due',
    body: `Follow-up for complaint ${input.complaintNumber} due on ${input.nextFollowUpAt.toISOString()}`,
    entityType: 'Complaint',
    entityId: input.complaintId,
    userId: input.userId,
  });
}

export async function createComplaintEscalatedNotification(input: {
  workspaceId: string;
  complaintId: string;
  complaintNumber: string;
  userId?: string;
}): Promise<ILegalNotification> {
  return createLegalNotification({
    workspaceId: input.workspaceId,
    type: 'COMPLAINT_ESCALATED',
    title: 'Complaint escalated',
    body: `Complaint ${input.complaintNumber} has been escalated for review`,
    entityType: 'Complaint',
    entityId: input.complaintId,
    userId: input.userId,
  });
}
