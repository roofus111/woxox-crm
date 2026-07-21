import { runAnalyticsRefreshJob } from './analytics-refresh.job.js';
import { runEvidenceProcessingJob } from './evidence-processing.job.js';
import { runHearingRemindersJob } from './hearing-reminders.job.js';
import { runProviderSyncJob } from './provider-sync.job.js';

const JOB_INTERVAL_MS = 60_000;

let timer: NodeJS.Timeout | undefined;
let running = false;

async function runAllJobs(): Promise<void> {
  if (running) {
    return;
  }

  running = true;
  try {
    const results = await Promise.allSettled([
      runHearingRemindersJob(),
      runProviderSyncJob(),
      runEvidenceProcessingJob(),
      runAnalyticsRefreshJob(),
    ]);

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.processed > 0) {
        console.info('[jobs]', result.value.job, 'processed', result.value.processed);
      }
      if (result.status === 'rejected') {
        console.error('[jobs] failure:', result.reason);
      }
    }
  } finally {
    running = false;
  }
}

export function startBackgroundJobs(): void {
  if (timer) {
    return;
  }

  void runAllJobs();
  timer = setInterval(() => {
    void runAllJobs();
  }, JOB_INTERVAL_MS);

  console.info('[jobs] background scheduler started');
}

export function stopBackgroundJobs(): void {
  if (timer) {
    clearInterval(timer);
    timer = undefined;
  }
}

export {
  runHearingRemindersJob,
  runProviderSyncJob,
  runEvidenceProcessingJob,
  runAnalyticsRefreshJob,
};
