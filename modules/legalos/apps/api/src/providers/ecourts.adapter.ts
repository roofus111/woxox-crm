import { env } from '../config/env.js';
import type {
  CauseListEntry,
  CauseListQuery,
  CourtCaseSearch,
  CourtCaseSummary,
  CourtDataProvider,
  ExternalCaseRef,
  LegalJudgment,
  LegalOrder,
  NormalizedCourtCase,
  ProviderCapability,
  ProviderResult,
  SyncOutcome,
  SyncRequest,
} from './types.js';

function notConfiguredResult<T>(provider: string): ProviderResult<T> {
  return {
    ok: false,
    provider,
    fetchedAt: new Date().toISOString(),
    error: {
      code: 'PROVIDER_NOT_CONFIGURED',
      message: `${provider} is not configured. Obtain official credentials and enable the provider flag.`,
    },
  };
}

export class EcourtsAdapter implements CourtDataProvider {
  readonly id = 'ecourts' as const;

  private isEnabled(): boolean {
    return (
      env.LEGALOS_PROVIDER_ECOURTS_ENABLED &&
      Boolean(env.ECOURTS_BASE_URL && env.ECOURTS_CLIENT_ID && env.ECOURTS_CLIENT_SECRET)
    );
  }

  capabilities(): ProviderCapability[] {
    const configured = this.isEnabled();
    return [
      {
        id: 'case_search',
        label: 'Case search',
        state: configured ? 'available' : 'not_configured',
        description: 'Search cases via official eCourts API when licensed credentials are configured.',
      },
      {
        id: 'case_status',
        label: 'Case status & history',
        state: configured ? 'available' : 'not_configured',
      },
      {
        id: 'orders',
        label: 'Orders',
        state: configured ? 'available' : 'not_configured',
      },
      {
        id: 'judgments',
        label: 'Judgments',
        state: configured ? 'available' : 'not_configured',
      },
      {
        id: 'cause_list',
        label: 'Cause list',
        state: configured ? 'available' : 'not_configured',
      },
      {
        id: 'sync',
        label: 'Authorized sync',
        state: configured ? 'available' : 'disabled',
      },
    ];
  }

  async searchCases(input: CourtCaseSearch): Promise<ProviderResult<CourtCaseSummary[]>> {
    if (!this.isEnabled()) {
      return notConfiguredResult<CourtCaseSummary[]>(this.id);
    }

    const { licensedGetJson, ecourtsAccessToken } = await import('./licensed-http.js');
    const token = await ecourtsAccessToken();
    if (!token) {
      return {
        ok: false,
        provider: this.id,
        fetchedAt: new Date().toISOString(),
        error: {
          code: 'PROVIDER_AUTH_FAILED',
          message: 'eCourts OAuth token could not be obtained with configured credentials',
        },
      };
    }

    const base = env.ECOURTS_BASE_URL!.replace(/\/$/, '');
    const url = `${base}/api/v1/cases/search?q=${encodeURIComponent(input.query)}`;
    const result = await licensedGetJson<{ items?: CourtCaseSummary[] } | CourtCaseSummary[]>(
      this.id,
      url,
      { Authorization: `Bearer ${token}` },
    );

    if (!result.ok) return result as ProviderResult<CourtCaseSummary[]>;
    const raw = result.data;
    const items = Array.isArray(raw) ? raw : (raw?.items ?? []);
    return {
      ok: true,
      provider: this.id,
      fetchedAt: result.fetchedAt,
      data: items,
    };
  }

  async getCase(_input: ExternalCaseRef): Promise<ProviderResult<NormalizedCourtCase>> {
    if (!this.isEnabled()) {
      return notConfiguredResult<NormalizedCourtCase>(this.id);
    }

    return notConfiguredResult<NormalizedCourtCase>(this.id);
  }

  async getOrders(_input: ExternalCaseRef): Promise<ProviderResult<LegalOrder[]>> {
    if (!this.isEnabled()) {
      return notConfiguredResult<LegalOrder[]>(this.id);
    }

    return notConfiguredResult<LegalOrder[]>(this.id);
  }

  async getJudgments(_input: ExternalCaseRef): Promise<ProviderResult<LegalJudgment[]>> {
    if (!this.isEnabled()) {
      return notConfiguredResult<LegalJudgment[]>(this.id);
    }

    return notConfiguredResult<LegalJudgment[]>(this.id);
  }

  async getCauseList(_input: CauseListQuery): Promise<ProviderResult<CauseListEntry[]>> {
    if (!this.isEnabled()) {
      return notConfiguredResult<CauseListEntry[]>(this.id);
    }

    return notConfiguredResult<CauseListEntry[]>(this.id);
  }

  async sync(input: SyncRequest): Promise<SyncOutcome> {
    if (!this.isEnabled()) {
      return {
        status: 'disabled',
        externalKey: input.externalKey,
        message: 'eCourts provider is disabled or not configured',
      };
    }

    return {
      status: 'queued',
      externalKey: input.externalKey,
      message: 'Sync queued for official eCourts adapter worker',
    };
  }
}
