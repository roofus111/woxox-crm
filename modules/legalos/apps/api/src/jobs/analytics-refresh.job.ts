import mongoose from 'mongoose';
import { Hearing } from '../modules/legal/models/hearing.model.js';
import { analyticsService } from '../modules/legal/services/analytics.service.js';
import type { JobRunResult } from './types.js';

const analyticsCache = new Map<string, { refreshedAt: number; payload: unknown }>();

export async function runAnalyticsRefreshJob(workspaceId?: string): Promise<JobRunResult> {
  const workspaces = workspaceId
    ? [workspaceId]
    : [...new Set((await Hearing.distinct('workspaceId')).map(String))];

  let processed = 0;

  for (const ws of workspaces) {
    if (!mongoose.Types.ObjectId.isValid(ws)) {
      continue;
    }
    const payload = await analyticsService.getPortfolio(ws);
    analyticsCache.set(ws, { refreshedAt: Date.now(), payload });
    processed += 1;
  }

  return { job: 'analytics-refresh', processed, details: { cacheSize: analyticsCache.size } };
}

export function getCachedAnalytics(workspaceId: string): unknown | undefined {
  return analyticsCache.get(workspaceId)?.payload;
}
