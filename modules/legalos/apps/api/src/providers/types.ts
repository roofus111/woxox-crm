export type ProviderCapabilityState = 'available' | 'not_configured' | 'unsupported' | 'disabled';

export interface ProviderCapability {
  id: string;
  label: string;
  state: ProviderCapabilityState;
  description?: string;
}

export interface ProviderResult<T> {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  provider: string;
  fetchedAt: string;
}

export interface CourtCaseSearch {
  workspaceId: string;
  query: string;
  court?: string;
  state?: string;
  year?: number;
}

export interface ExternalCaseRef {
  workspaceId: string;
  externalKey: string;
  cino?: string;
}

export interface CourtCaseSummary {
  externalKey: string;
  caseNumber?: string;
  title?: string;
  court?: string;
  status?: string;
}

export interface NormalizedCourtCase {
  externalKey: string;
  caseNumber?: string;
  title?: string;
  court?: Record<string, string>;
  parties?: string[];
  status?: string;
  nextHearingAt?: string;
  history?: Array<{ date: string; event: string }>;
}

export interface LegalOrder {
  externalKey: string;
  orderDate: string;
  title?: string;
  url?: string;
}

export interface LegalJudgment {
  externalKey: string;
  judgmentDate: string;
  citation?: string;
  title?: string;
  url?: string;
}

export interface CauseListQuery {
  workspaceId: string;
  court: string;
  date: string;
}

export interface CauseListEntry {
  serialNo?: number;
  caseNumber?: string;
  parties?: string;
  purpose?: string;
  courtNumber?: string;
}

export interface SyncRequest {
  workspaceId: string;
  entityType: string;
  entityId: string;
  externalKey: string;
  force?: boolean;
}

export interface SyncOutcome {
  status: 'queued' | 'succeeded' | 'failed' | 'disabled';
  externalKey: string;
  message?: string;
  normalized?: Record<string, unknown>;
}

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

export interface ResearchQuery {
  workspaceId: string;
  query: string;
  filters?: Record<string, string | number | boolean>;
}

export interface ResearchResult {
  ok: boolean;
  provider: string;
  hits: Array<{ id: string; title: string; citation?: string; snippet?: string }>;
  message?: string;
}

export interface ProviderDocumentRef {
  workspaceId: string;
  externalId: string;
}

export interface ResearchDocument {
  id: string;
  title: string;
  body?: string;
  citation?: string;
  url?: string;
}

export interface LegalResearchProvider {
  id: 'scc-online' | 'manupatra';
  capabilities(): ProviderCapability[];
  search(q: ResearchQuery): Promise<ResearchResult>;
  getDocument(ref: ProviderDocumentRef): Promise<ResearchDocument>;
  isConfigured(workspaceId: string): Promise<boolean>;
}

export type RegisteredProvider = CourtDataProvider | LegalResearchProvider;
