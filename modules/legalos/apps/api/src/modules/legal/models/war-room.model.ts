import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { softDeletePlugin } from '../../../common/soft-delete.plugin.js';
import { WAR_ROOM_ENTRY_TYPES } from '../enums.js';

export interface IWarRoomEntry extends Document {
  workspaceId: mongoose.Types.ObjectId;
  caseId: mongoose.Types.ObjectId;
  type: (typeof WAR_ROOM_ENTRY_TYPES)[number];
  title?: string;
  body: string;
  authorId: string;
  pinned: boolean;
  parentId?: mongoose.Types.ObjectId;
  deletedAt?: Date | null;
  deletedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const WarRoomEntrySchema = new Schema<IWarRoomEntry>(
  {
    workspaceId: { type: Schema.Types.ObjectId, required: true, index: true },
    caseId: { type: Schema.Types.ObjectId, ref: 'LegalCase', required: true, index: true },
    type: { type: String, enum: WAR_ROOM_ENTRY_TYPES, required: true, index: true },
    title: { type: String, trim: true, maxlength: 300 },
    body: { type: String, required: true, maxlength: 20000 },
    authorId: { type: String, required: true, trim: true, index: true },
    pinned: { type: Boolean, default: false, index: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'WarRoomEntry' },
  },
  { timestamps: true, optimisticConcurrency: true, collection: 'legal_war_room_entries' },
);

WarRoomEntrySchema.plugin(softDeletePlugin);
WarRoomEntrySchema.index({ workspaceId: 1, caseId: 1, pinned: -1, createdAt: -1 });
WarRoomEntrySchema.index({ workspaceId: 1, caseId: 1, parentId: 1, createdAt: 1 });

export const WarRoomEntry: Model<IWarRoomEntry> =
  mongoose.models.WarRoomEntry ??
  mongoose.model<IWarRoomEntry>('WarRoomEntry', WarRoomEntrySchema);
