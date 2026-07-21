import { LegalNotification } from '../models/legal-notification.model.js';
import mongoose from 'mongoose';

export class NotificationsService {
  async listFeed(workspaceId: string, limit = 30) {
    return LegalNotification.find({
      workspaceId: new mongoose.Types.ObjectId(workspaceId),
    })
      .sort({ createdAt: -1 })
      .limit(Math.min(100, limit))
      .lean();
  }

  async markRead(workspaceId: string, id: string) {
    return LegalNotification.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        workspaceId: new mongoose.Types.ObjectId(workspaceId),
      },
      { $set: { readAt: new Date() } },
      { new: true },
    ).lean();
  }
}

export const notificationsService = new NotificationsService();
