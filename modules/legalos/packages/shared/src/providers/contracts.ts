import type { SyncRequestDto } from '../dto/providers';
import type { ProviderId, SyncStatus } from '../enums';

/** Capability flags exposed by licensed court data providers. */
export type ProviderCapability =
  | 'case_search'
  | 'case_detail'
  | 'party_search'
  | 'advocate_search'
  | 'orders'
  | 'judgments'
  | 'cause_list'
  | 'filing_data'
  | 'sync'
  | 'manual_import';

/** Provider capability availability state for UI and policy gates. */
export type ProviderCapabilityState =
  | 'configured'
  | 'not_configured'
  | 'unsupported'
  | 'rate_limited'
  | 'degraded';

/** Structured provider-layer error. */
export interface ProviderError {
  code: string;
  message: string;
  retryable: boolean;
  httpStatus?: number;
  details?: Record<string, unknown>;
}

/** Normalized wrapper for all provider adapter responses. */
export interface ProviderResult<T> {
  ok: boolean;
  data?: T;
  error?: ProviderError;
  capabilityState?: ProviderCapabilityState;
  fetchedAt: string;
  provider: ProviderId;
  attribution?: string;
}

/** External case reference used across court data provider methods. */
export interface ExternalCaseRef {
  externalKey: string;
  cino?: string;
  caseNumber?: string;
  courtCode?: string;
  state?: string;
  district?: string;
}

/** Search input for court case discovery. */
export interface CourtCaseSearch {
  q?: string;
  cino?: string;
  caseNumber?: string;
  partyName?: string;
  advocateName?: string;
  courtCode?: string;
  state?: string;
  district?: string;
  year?: number;
  page?: number;
  limit?: number;
}

/** Summary record returned from case search operations. */
export interface CourtCaseSummary {
  externalKey: string;
  cino?: string;
  caseNumber?: string;
  title?: string;
  courtName?: string;
  state?: string;
  district?: string;
  status?: string;
  filingDate?: string;
  nextHearingDate?: string;
  petitioner?: string;
  respondent?: string;
}

/** Normalized full court case snapshot mapped from provider payloads. */
export interface NormalizedCourtCase {
  externalKey: string;
  cino?: string;
  caseNumber?: string;
  title?: string;
  caseType?: string;
  status?: string;
  court: {
    name?: string;
    state?: string;
    district?: string;
    courtNumber?: string;
    bench?: string;
    judgeName?: string;
  };
  parties: Array<{
    name: string;
    role: 'petitioner' | 'respondent' | 'applicant' | 'other';
    advocateNames?: string[];
  }>;
  filingDate?: string;
  registrationDate?: string;
  nextHearingDate?: string;
  disposalDate?: string;
  actsAndSections?: string[];
  caseHistory?: Array<{
    date: string;
    purpose?: string;
    judgeName?: string;
    orderText?: string;
  }>;
  providerRefs: Array<{
    provider: ProviderId;
    externalKey: string;
  }>;
  lastSyncedAt?: string;
}

/** Normalized court order record. */
export interface LegalOrder {
  externalKey: string;
  orderNumber?: string;
  orderDate: string;
  orderType?: string;
  judgeName?: string;
  bench?: string;
  summary?: string;
  documentUrl?: string;
  downloadable: boolean;
}

/** Normalized judgment record. */
export interface LegalJudgment {
  externalKey: string;
  citation?: string;
  title?: string;
  judgmentDate: string;
  courtName?: string;
  bench?: string;
  judgeNames?: string[];
  summary?: string;
  headnote?: string;
  documentUrl?: string;
  downloadable: boolean;
}

/** Cause list query parameters. */
export interface CauseListQuery {
  courtCode: string;
  date: string;
  bench?: string;
  courtNumber?: string;
}

/** Single cause list entry for a given court date. */
export interface CauseListEntry {
  itemNumber?: string;
  caseNumber?: string;
  cino?: string;
  externalKey?: string;
  title?: string;
  purpose?: string;
  bench?: string;
  judgeName?: string;
  petitioner?: string;
  respondent?: string;
  status?: string;
}

/** Provider sync request passed to court data adapters. */
export interface SyncRequest extends SyncRequestDto {
  workspaceId: string;
  provider: ProviderId;
}

/** Outcome of a provider synchronization operation. */
export interface SyncOutcome {
  status: SyncStatus;
  provider: ProviderId;
  entityType: string;
  entityId?: string;
  externalKey?: string;
  startedAt: string;
  completedAt?: string;
  recordsProcessed?: number;
  error?: ProviderError;
  correlationId?: string;
}

/** Licensed legal research query. */
export interface ResearchQuery {
  query: string;
  documentType?: 'judgment' | 'order' | 'bare_act' | 'citation' | 'commentary' | 'all';
  court?: string;
  bench?: string;
  judge?: string;
  yearFrom?: number;
  yearTo?: number;
  act?: string;
  section?: string;
  citation?: string;
  page?: number;
  limit?: number;
}

/** Search hit from a legal research provider. */
export interface ResearchHit {
  ref: string;
  title: string;
  citation?: string;
  court?: string;
  bench?: string;
  judgmentDate?: string;
  snippet?: string;
  documentType: string;
  attribution: string;
}

/** Paginated research search result. */
export interface ResearchResult {
  hits: ResearchHit[];
  total: number;
  page: number;
  limit: number;
  provider: ProviderId.SccOnline | ProviderId.Manupatra;
  query: string;
  attribution: string;
}

/** Opaque document reference from a research provider. */
export interface ProviderDocumentRef {
  ref: string;
  provider: ProviderId.SccOnline | ProviderId.Manupatra;
}

/** Full research document retrieved from a provider. */
export interface ResearchDocument {
  ref: string;
  provider: ProviderId.SccOnline | ProviderId.Manupatra;
  title: string;
  citation?: string;
  court?: string;
  bench?: string;
  judgmentDate?: string;
  content: string;
  contentFormat: 'html' | 'text' | 'pdf_url';
  citations?: string[];
  relatedRefs?: string[];
  attribution: string;
  exportRestricted: boolean;
}

/**
 * Licensed court data provider contract.
 * Adapters must map raw official payloads to normalized WOXOX LegalOS types.
 */
export interface CourtDataProvider {
  id: 'ecourts';
  capabilities(): ProviderCapability[];
  searchCases(input: CourtCaseSearch): Promise<ProviderResult<CourtCaseSummary[]>>;
  getCase(input: ExternalCaseRef): Promise<ProviderResult<NormalizedCourtCase>>;
  getOrders(input: ExternalCaseRef): Promise<ProviderResult<LegalOrder[]>>;
  getJudgments(input: ExternalCaseRef): Promise<ProviderResult<LegalJudgment[]>>;
  getCauseList(input: CauseListQuery): Promise<ProviderResult<CauseListEntry[]>>;
  sync(input: SyncRequest): Promise<SyncOutcome>;
}

/**
 * Licensed legal research provider contract.
 * Search and document retrieval must respect tenant licensing and attribution rules.
 */
export interface LegalResearchProvider {
  id: 'scc-online' | 'manupatra';
  search(q: ResearchQuery): Promise<ResearchResult>;
  getDocument(ref: ProviderDocumentRef): Promise<ResearchDocument>;
  isConfigured(workspaceId: string): Promise<boolean>;
}

/** Runtime descriptor for provider capability registry entries. */
export interface ProviderCapabilityDescriptor {
  provider: ProviderId;
  capabilities: ProviderCapability[];
  configured: boolean;
  capabilityState: ProviderCapabilityState;
  lastSyncAt?: string;
  attribution?: string;
}
