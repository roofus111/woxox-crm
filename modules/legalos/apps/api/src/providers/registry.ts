import type { ProviderId } from '../modules/legal/enums.js';
import { EcourtsAdapter } from './ecourts.adapter.js';
import { ManupatraAdapter } from './manupatra.adapter.js';
import { SccOnlineAdapter } from './scc-online.adapter.js';
import type {
  CourtDataProvider,
  LegalResearchProvider,
  ProviderCapability,
  RegisteredProvider,
} from './types.js';

const ecourts = new EcourtsAdapter();
const sccOnline = new SccOnlineAdapter();
const manupatra = new ManupatraAdapter();

const registry = new Map<ProviderId, RegisteredProvider>([
  ['ecourts', ecourts],
  ['scc-online', sccOnline],
  ['manupatra', manupatra],
]);

export function getProvider(providerId: ProviderId): RegisteredProvider | undefined {
  return registry.get(providerId);
}

export function getCourtDataProvider(providerId: ProviderId): CourtDataProvider | undefined {
  const provider = registry.get(providerId);
  return provider && 'sync' in provider ? (provider as CourtDataProvider) : undefined;
}

export function getResearchProvider(providerId: ProviderId): LegalResearchProvider | undefined {
  const provider = registry.get(providerId);
  if (!provider || providerId === 'ecourts') {
    return undefined;
  }
  return 'search' in provider ? (provider as LegalResearchProvider) : undefined;
}

export function listAllCapabilities(): Array<{
  provider: ProviderId;
  capabilities: ProviderCapability[];
}> {
  return Array.from(registry.entries()).map(([provider, adapter]) => ({
    provider,
    capabilities: adapter.capabilities(),
  }));
}

export { ecourts, sccOnline, manupatra };
