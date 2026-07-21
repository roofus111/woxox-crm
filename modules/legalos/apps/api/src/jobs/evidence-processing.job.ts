import { socketEmitter } from '../host/socket.emitter.js';
import { Evidence } from '../modules/legal/models/evidence.model.js';
import type { JobRunResult } from './types.js';

export async function runEvidenceProcessingJob(): Promise<JobRunResult> {
  const pending = await Evidence.find({
    deletedAt: null,
    status: { $in: ['PENDING_UPLOAD', 'UPLOADED', 'PROCESSING'] },
  })
    .sort({ createdAt: 1 })
    .limit(50);

  let processed = 0;

  for (const evidence of pending) {
    if (evidence.status === 'PENDING_UPLOAD' && evidence.storageKey) {
      evidence.status = 'PROCESSING';
      evidence.custodyEvents.push({
        eventId: `evt_${Date.now()}`,
        action: 'UPLOADED',
        actorId: 'system',
        occurredAt: new Date(),
        storageKey: evidence.storageKey,
        notes: 'Upload acknowledged by processing worker stub',
      });
    } else if (evidence.status === 'PROCESSING') {
      evidence.status = 'AVAILABLE';
    }

    await evidence.save();

    socketEmitter.emitEvidenceProcessed({
      workspaceId: evidence.workspaceId.toString(),
      entityId: evidence.id,
      data: { status: evidence.status },
    });

    processed += 1;
  }

  return { job: 'evidence-processing', processed };
}
