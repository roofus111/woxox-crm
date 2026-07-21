import { env } from '../config/env.js';
import type {
  LegalResearchProvider,
  ProviderCapability,
  ProviderDocumentRef,
  ResearchDocument,
  ResearchQuery,
  ResearchResult,
} from './types.js';

export class ManupatraAdapter implements LegalResearchProvider {
  readonly id = 'manupatra' as const;

  private isEnabled(): boolean {
    return env.LEGALOS_PROVIDER_MANUPATRA_ENABLED && Boolean(env.MANUPATRA_API_KEY);
  }

  capabilities(): ProviderCapability[] {
    const configured = this.isEnabled();
    return [
      {
        id: 'case_search',
        label: 'Case search',
        state: configured ? 'available' : 'not_configured',
      },
      {
        id: 'judgments',
        label: 'Judgments',
        state: configured ? 'available' : 'not_configured',
      },
      {
        id: 'citation_network',
        label: 'Citation network',
        state: configured ? 'available' : 'not_configured',
      },
      {
        id: 'knowledge_graph',
        label: 'Knowledge graph',
        state: configured ? 'unsupported' : 'not_configured',
        description: 'Requires licensed Manupatra API scope.',
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
        message: 'Manupatra is not configured. Provide licensed API credentials via WOXOX secret manager.',
      };
    }

    const { licensedGetJson } = await import('./licensed-http.js');
    const base = (process.env.MANUPATRA_BASE_URL || 'https://api.manupatra.com').replace(/\/$/, '');
    const url = `${base}/v1/search?q=${encodeURIComponent(q.query)}`;
    const result = await licensedGetJson<{ hits?: ResearchResult['hits'] }>(this.id, url, {
      'X-Api-Key': env.MANUPATRA_API_KEY!,
    });

    if (!result.ok) {
      return {
        ok: false,
        provider: this.id,
        hits: [],
        message: result.error?.message ?? 'Manupatra search failed',
      };
    }

    return {
      ok: true,
      provider: this.id,
      hits: result.data?.hits ?? [],
      message: 'Manupatra licensed search',
    };
  }

  async getDocument(ref: ProviderDocumentRef): Promise<ResearchDocument> {
    if (!this.isEnabled()) {
      throw new Error('Manupatra is not configured');
    }

    const { licensedGetJson } = await import('./licensed-http.js');
    const base = (process.env.MANUPATRA_BASE_URL || 'https://api.manupatra.com').replace(/\/$/, '');
    const url = `${base}/v1/documents/${encodeURIComponent(ref.externalId)}`;
    const result = await licensedGetJson<ResearchDocument>(this.id, url, {
      'X-Api-Key': env.MANUPATRA_API_KEY!,
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
