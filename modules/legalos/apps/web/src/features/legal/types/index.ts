export type MatterStatus = "pending" | "active" | "disposed" | "archived";
export type CaseStage = "filing" | "admission" | "evidence" | "arguments" | "judgment" | "disposed";
export type ComplaintStatus = "registered" | "under_inquiry" | "converted_to_fir" | "closed" | "rejected";
export type FirStatus = "registered" | "investigation" | "chargesheet" | "closed";
export type BailStatus = "not_applicable" | "applied" | "granted" | "rejected" | "expired";
export type FilingStatus = "draft" | "checklist" | "filed" | "defect" | "refiled" | "registered";
export type FilingType =
  | "petition"
  | "application"
  | "reply"
  | "affidavit"
  | "vakalatnama"
  | "written_statement"
  | "interim_application"
  | "other";
export type KnowledgeCategory =
  | "template"
  | "act"
  | "rule"
  | "circular"
  | "notification"
  | "sop"
  | "draft";
export type AiTask =
  | "judgment_summary"
  | "bare_act_explanation"
  | "petition_draft"
  | "hearing_prep"
  | "risk_analysis"
  | "timeline";
export type HearingType = "regular" | "urgent" | "final" | "mention";
export type ProviderId = "ecourts" | "scc" | "manupatra";
export type ProviderStatus = "connected" | "degraded" | "offline" | "not_configured";

export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  court: string;
  bench?: string;
  clientId: string;
  clientName: string;
  advocate: string;
  status: MatterStatus;
  stage: CaseStage;
  nextHearing?: string;
  filingDate: string;
  category: string;
  cnrs?: string;
  priority: "low" | "medium" | "high";
  lastOrder?: string;
}

export interface Complaint {
  id: string;
  complaintNumber: string;
  complainant: string;
  respondent?: string;
  subject: string;
  policeStation: string;
  district: string;
  status: ComplaintStatus;
  registeredAt: string;
  category: string;
  firId?: string;
  assignedOfficer?: string;
  description: string;
  nextFollowUpAt?: string;
}

export interface Fir {
  id: string;
  firNumber: string;
  sections: string[];
  policeStation: string;
  district: string;
  complainant: string;
  accused?: string;
  status: FirStatus;
  registeredAt: string;
  investigatingOfficer: string;
  linkedComplaintId?: string;
  summary: string;
  bailStatus?: BailStatus;
  chargeSheet?: {
    filedAt?: string;
    referenceNumber?: string;
    notes?: string;
  };
}

export interface Hearing {
  id: string;
  caseId: string;
  caseNumber: string;
  title: string;
  court: string;
  bench: string;
  dateTime: string;
  type: HearingType;
  itemNumber?: number;
  advocate: string;
}

export interface CauseListItem {
  id: string;
  itemNumber: number;
  caseNumber: string;
  title: string;
  purpose: string;
  court: string;
  bench: string;
  advocate: string;
  status: "listed" | "adjourned" | "part_heard" | "disposed";
}

export interface Client {
  id: string;
  name: string;
  type: "individual" | "corporate";
  email?: string;
  phone: string;
  city: string;
  activeMatters: number;
  totalBilled: number;
  joinedAt: string;
}

export interface EvidenceItem {
  id: string;
  caseId: string;
  caseNumber: string;
  title: string;
  type: "document" | "photo" | "video" | "audio" | "physical";
  uploadedAt: string;
  hash: string;
  size: string;
  status: "verified" | "pending" | "rejected";
  uploadedBy: string;
  sealed?: boolean;
}

export interface CourtNotice {
  id: string;
  title: string;
  court: string;
  issuedAt: string;
  deadline?: string;
  type: "summons" | "notice" | "order" | "circular";
  matterRef?: string;
}

export interface LegalNewsItem {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  category: string;
  url?: string;
}

export interface JudgmentItem {
  id: string;
  citation: string;
  title: string;
  court: "SC" | "HC" | "District";
  bench: string;
  date: string;
  summary: string;
}

export interface AiInsight {
  id: string;
  title: string;
  summary: string;
  type: "risk" | "opportunity" | "compliance" | "research";
  priority: "low" | "medium" | "high";
  relatedCaseId?: string;
}

export interface ComplianceItem {
  id: string;
  title: string;
  dueDate: string;
  status: "pending" | "overdue" | "completed";
  category: string;
  matterRef?: string;
}

export interface CaseAlert {
  id: string;
  caseId: string;
  caseNumber: string;
  message: string;
  severity: "info" | "warning" | "critical";
  createdAt: string;
}

export interface BillingEntry {
  id: string;
  clientId: string;
  clientName: string;
  matterRef: string;
  amount: number;
  status: "draft" | "sent" | "paid" | "overdue";
  dueDate: string;
  issuedAt: string;
}

export interface ProviderConfig {
  id: ProviderId;
  name: string;
  status: ProviderStatus;
  lastSync?: string;
  enabled: boolean;
  description: string;
}

export interface DashboardData {
  kpis: {
    activeMatters: number;
    pendingMatters: number;
    disposedThisMonth: number;
    newClientsThisMonth: number;
    pendingComplaints: number;
    pendingFirs: number;
    revenueThisMonth: number;
    complianceOverdue: number;
  };
  todaysHearings: Hearing[];
  upcomingHearings: Hearing[];
  causeList: CauseListItem[];
  pendingMatters: Case[];
  disposedMatters: Case[];
  newClients: Client[];
  caseAlerts: CaseAlert[];
  courtNotices: CourtNotice[];
  recentOrders: { id: string; caseNumber: string; title: string; date: string; court: string }[];
  latestJudgments: JudgmentItem[];
  legalNews: LegalNewsItem[];
  hcScUpdates: LegalNewsItem[];
  aiInsights: AiInsight[];
  pendingCompliance: ComplianceItem[];
  complaints: Complaint[];
  pendingFirs: Fir[];
  calendarEvents: { id: string; title: string; date: string; type: string; court?: string }[];
  revenueAnalytics: { month: string; revenue: number; billed: number }[];
  practiceAnalytics: { category: string; count: number }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Filing {
  id: string;
  caseId: string;
  caseNumber?: string;
  title: string;
  filingType: FilingType;
  status: FilingStatus;
  diaryNumber?: string;
  courtFees?: number;
  stampDuty?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface KnowledgeDoc {
  id: string;
  title: string;
  category: KnowledgeCategory;
  body: string;
  tags: string[];
  bookmarked: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface LegalNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  href?: string;
}

export interface AiRequestResult {
  id: string;
  task: AiTask;
  result: string;
  model?: string;
  reviewRequired: boolean;
  citations: string[];
}

export interface ProviderCapabilityInfo {
  id: ProviderId;
  name: string;
  status: ProviderStatus;
  enabled: boolean;
  description: string;
  capabilities: string[];
  lastSync?: string;
}
