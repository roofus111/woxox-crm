import { env } from '../config/env.js';
import type {
  LegalResearchProvider,
  ProviderCapability,
  ProviderDocumentRef,
  ResearchDocument,
  ResearchQuery,
  ResearchResult,
} from './types.js';

export class SccOnlineAdapter implements LegalResearchProvider {
  readonly id = 'scc-online' as const;

  private isEnabled(): boolean {
    return env.LEGALOS_PROVIDER_SCC_ENABLED && Boolean(env.SCC_ONLINE_API_KEY);
  }

  capabilities(): ProviderCapability[] {
    const configured = this.isEnabled();
    return [
      {
        id: 'judgment_search',
        label: 'Judgment search',
        state: configured ? 'available' : 'not_configured',
      },
      {
        id: 'acts',
        label: 'Bare acts',
        state: configured ? 'available' : 'not_configured',
      },
      {
        id: 'citations',
        label: 'Citations',
        state: configured ? 'available' : 'not_configured',
      },
      {
        id: 'bookmarks',
        label: 'Bookmarks',
        state: configured ? 'unsupported' : 'not_configured',
        description: 'Requires licensed SCC Online API scope.',
      },
    ];
  }

  async isConfigured(_workspaceId: string): Promise<boolean> {
    return this.isEnabled();
  }

  async search(q: ResearchQuery): Promise<ResearchResult> {
    if (!this.isEnabled()) {
      return {
        ok: false,
        provider: this.id,
        hits: [],
        message: 'SCC Online is not configured. Provide licensed API credentials via WOXOX secret manager.',
      };
    }

    const { licensedGetJson } = await import('./licensed-http.js');
    const base = (process.env.SCC_ONLINE_BASE_URL || 'https://api.scconline.com').replace(/\/$/, '');
    const url = `${base}/v1/search?q=${encodeURIComponent(q.query)}`;
    const result = await licensedGetJson<{ hits?: ResearchResult['hits'] }>(this.id, url, {
      Authorization: `Bearer ${env.SCC_ONLINE_API_KEY}`,
    });

    if (!result.ok) {
      return {
        ok: false,
        provider: this.id,
        hits: [],
        message: result.error?.message ?? 'SCC search failed',
      };
    }

    return {
      ok: true,
      provider: this.id,
      hits: result.data?.hits ?? [],
      message: 'SCC Online licensed search',
    };
  }

  async getDocument(ref: ProviderDocumentRef): Promise<ResearchDocument> {
    if (!this.isEnabled()) {
      throw new Error('SCC Online is not configured');
    }

    const { licensedGetJson } = await import('./licensed-http.js');
    const base = (process.env.SCC_ONLINE_BASE_URL || 'https://api.scconline.com').replace(/\/$/, '');
    const url = `${base}/v1/documents/${encodeURIComponent(ref.externalId)}`;
    const result = await licensedGetJson<ResearchDocument>(this.id, url, {
      Authorization: `Bearer ${env.SCC_ONLINE_API_KEY}`,
    });

    if (!result.ok || !result.data) {
      return {
        id: ref.externalId,
        title: 'Document unavailable from licensed API',
      };
    }

    return result.data;
  }
}
