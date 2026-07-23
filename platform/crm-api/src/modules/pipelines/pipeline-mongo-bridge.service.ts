import { Injectable, Logger } from '@nestjs/common';

export type LegacyStagePayload = {
  name: string;
  description?: string;
  property: 'Pending' | 'Processing' | 'Won' | 'Lost';
  order: number;
};

export type LegacyPipelineSyncInput = {
  legacyMongoId?: string | null;
  name: string;
  description?: string | null;
  companyEmail?: string;
  stages: LegacyStagePayload[];
};

@Injectable()
export class PipelineMongoBridgeService {
  private readonly logger = new Logger(PipelineMongoBridgeService.name);

  async syncPublished(input: LegacyPipelineSyncInput): Promise<{ ok: boolean; mongoId?: string; message: string }> {
    const base = process.env.LEGACY_API_URL || process.env.BACKEND_API_URL;
    const secret = process.env.SUPER_ADMIN_PROVISION_SECRET;
    if (!base || !secret) {
      return {
        ok: false,
        message: 'Legacy sync skipped (LEGACY_API_URL / SUPER_ADMIN_PROVISION_SECRET not set)',
      };
    }

    try {
      const res = await fetch(`${base.replace(/\/$/, '')}/api/super-admin/sync-pipeline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-super-admin-secret': secret,
        },
        body: JSON.stringify(input),
      });
      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        mongoId?: string;
        _id?: string;
      };
      if (!res.ok) {
        return { ok: false, message: data.message || `Legacy sync failed (${res.status})` };
      }
      return {
        ok: true,
        mongoId: data.mongoId || data._id,
        message: data.message || 'Synced to legacy Mongo',
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Legacy sync error';
      this.logger.warn(message);
      return { ok: false, message };
    }
  }

  mapStageProperty(stage: {
    isWon?: boolean;
    isSuccess?: boolean;
    isLost?: boolean;
    isClosed?: boolean;
    stageType?: string;
  }): LegacyStagePayload['property'] {
    if (stage.isWon || stage.isSuccess || stage.stageType === 'success') return 'Won';
    if (stage.isLost || stage.stageType === 'lost') return 'Lost';
    if (stage.isClosed || stage.stageType === 'closed') return 'Processing';
    return 'Pending';
  }
}
