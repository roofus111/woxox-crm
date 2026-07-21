import { notificationService } from '../host/notification.service.js';
import { socketEmitter } from '../host/socket.emitter.js';
import { Hearing } from '../modules/legal/models/hearing.model.js';

import type { JobRunResult } from './types.js';

const REMINDER_WINDOW_MS = 24 * 60 * 60 * 1000;
const processedReminderKeys = new Set<string>();

export async function runHearingRemindersJob(): Promise<JobRunResult> {
  const now = new Date();
  const until = new Date(now.getTime() + REMINDER_WINDOW_MS);

  const hearings = await Hearing.find({
    deletedAt: null,
    status: { $in: ['SCHEDULED', 'ADJOURNED'] },
    scheduledAt: { $gte: now, $lte: until },
    reminderSentAt: { $exists: false },
  }).limit(100);

  let processed = 0;

  for (const hearing of hearings) {
    const key = `hearing:${hearing.id}:${hearing.scheduledAt.toISOString()}`;
    if (processedReminderKeys.has(key)) {
      continue;
    }

    for (const advocateId of hearing.assignedAdvocateIds) {
      await notificationService.sendHearingReminder({
        workspaceId: hearing.workspaceId.toString(),
        userId: advocateId.toString(),
        hearingId: hearing.id,
        caseTitle: hearing.title,
        scheduledAt: hearing.scheduledAt,
      });
    }

    hearing.reminderSentAt = new Date();
    await hearing.save();

    socketEmitter.emitHearingReminder({
      workspaceId: hearing.workspaceId.toString(),
      entityId: hearing.id,
      data: { scheduledAt: hearing.scheduledAt.toISOString() },
    });

    processedReminderKeys.add(key);
    processed += 1;
  }

  return { job: 'hearing-reminders', processed };
}
