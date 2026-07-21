import { socketEmitter } from '../host/socket.emitter.js';
import { ProviderSync } from '../modules/legal/models/provider-sync.model.js';
import { getCourtDataProvider } from '../providers/registry.js';
import type { JobRunResult } from './types.js';

export async function runProviderSyncJob(): Promise<JobRunResult> {
  const pending = await ProviderSync.find({
    status: 'PENDING',
    nextRunAt: { $lte: new Date() },
  })
    .sort({ nextRunAt: 1 })
    .limit(20);

  let processed = 0;

  for (const sync of pending) {
    sync.status = 'RUNNING';
    sync.lastRunAt = new Date();
    await sync.save();

    const provider = getCourtDataProvider(sync.provider);
    if (!provider) {
      sync.status = 'DISABLED';
      sync.lastError = 'Provider does not support sync';
      await sync.save();
      continue;
    }

    try {
      const outcome = await provider.sync({
        workspaceId: sync.workspaceId.toString(),
        entityType: sync.entityType,
        entityId: sync.entityId.toString(),
        externalKey: sync.externalKey,
      });

      sync.status = outcome.status === 'failed' ? 'FAILED' : 'SUCCEEDED';
      sync.lastSuccessAt = outcome.status === 'succeeded' ? new Date() : sync.lastSuccessAt;
      sync.normalizedSnapshot = outcome.normalized;
      sync.lastError = outcome.message;
      sync.nextRunAt = undefined;
      await sync.save();

      socketEmitter.emitProviderSyncCompleted({
        workspaceId: sync.workspaceId.toString(),
        entityId: sync.id,
        data: { provider: sync.provider, status: sync.status },
      });

      processed += 1;
    } catch (err) {
      sync.status = 'FAILED';
      sync.lastError = err instanceof Error ? err.message : 'Sync failed';
      await sync.save();
    }
  }

  return { job: 'provider-sync', processed };
}
