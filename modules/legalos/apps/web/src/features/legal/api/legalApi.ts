import type {
  AiRequestResult,
  AiTask,
  Case,
  Complaint,
  DashboardData,
  EvidenceItem,
  Filing,
  Fir,
  Hearing,
  KnowledgeDoc,
  LegalNotification,
  PaginatedResponse,
  ProviderCapabilityInfo,
} from "../types";
import {
  getMockCaseById,
  getMockComplaintById,
  getMockFilingById,
  getMockFirById,
  mockCases,
  mockComplaints,
  mockDashboard,
  mockEvidence,
  mockFilings,
  mockFirs,
  mockHearings,
  mockKnowledge,
  mockNotifications,
  mockProviders,
} from "../utils/mock-data";
import {
  mockBranches,
  mockConflictMatches,
  mockGraph,
  mockStaff,
  mockTimeEntries,
  mockWarRoomFeed,
  mockWorkflows,
  type Branch,
  type FirmStaff,
} from "../utils/enterprise-mock";
import {
  mapAiRequest,
  mapCase,
  mapComplaint,
  mapEvidence,
  mapFiling,
  mapFir,
  mapHearing,
  mapKnowledgeDoc,
  mapNotification,
  mapPortfolio,
  mapProviderCapabilities,
  type PortfolioRaw,
} from "./mappers";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1/legal";
const ALLOW_MOCKS =
  process.env.NEXT_PUBLIC_ALLOW_MOCKS === "true" && process.env.NODE_ENV !== "production";

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type Envelope<T> = { success: boolean; data: T; meta?: Record<string, unknown> };

function authHeaders(): HeadersInit {
  let token = "";
  let workspaceId = "";

  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem("legalos-auth");
      if (raw) {
        const parsed = JSON.parse(raw) as { state?: { token?: string; workspaceId?: string } };
        token = parsed.state?.token || "";
        workspaceId = parsed.state?.workspaceId || "";
      }
    } catch {
      // ignore corrupt storage
    }
  }

  // Dev-only convenience fallbacks — never bake public bearer tokens into production builds
  if (process.env.NODE_ENV !== "production") {
    if (!token) {
      token = process.env.NEXT_PUBLIC_LEGALOS_BEARER_TOKEN?.trim() || "demo";
    }
    if (!workspaceId) {
      workspaceId =
        process.env.NEXT_PUBLIC_WORKSPACE_ID?.trim() || "000000000000000000000001";
    }
  }

  if (!token) {
    throw new ApiError("Not signed in — open /login");
  }
  if (!workspaceId) {
    throw new ApiError("Workspace missing — open /login");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "X-Workspace-Id": workspaceId,
  };
}

async function fetchEnvelope<T>(path: string, init?: RequestInit): Promise<{ data: T; meta?: Record<string, unknown> }> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...authHeaders(),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    throw new ApiError(`API error: ${res.statusText}`, res.status);
  }

  const json = (await res.json()) as Envelope<T> | T;
  if (json && typeof json === "object" && "success" in json && "data" in json) {
    const env = json as Envelope<T>;
    return { data: env.data, meta: env.meta };
  }
  return { data: json as T };
}

async function withMockFallback<T>(apiCall: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await apiCall();
  } catch (err) {
    if (!ALLOW_MOCKS) {
      throw err;
    }
    return fallback;
  }
}

function filterHearingsByRange(
  hearings: Hearing[],
  from?: string,
  to?: string,
  q?: string
): Hearing[] {
  let items = hearings;
  if (from || to) {
    const fromMs = from ? new Date(from).getTime() : 0;
    const toMs = to ? new Date(to).getTime() : Number.MAX_SAFE_INTEGER;
    items = items.filter((h) => {
      const t = new Date(h.dateTime).getTime();
      return t >= fromMs && t <= toMs;
    });
  }
  if (q?.trim()) {
    const needle = q.toLowerCase();
    items = items.filter(
      (h) =>
        h.caseNumber.toLowerCase().includes(needle) ||
        h.title.toLowerCase().includes(needle) ||
        h.court.toLowerCase().includes(needle) ||
        h.bench.toLowerCase().includes(needle)
    );
  }
  return items;
}

function toPaginated<T>(items: T[], meta?: Record<string, unknown>): PaginatedResponse<T> {
  return {
    data: items,
    total: Number(meta?.total ?? items.length),
    page: Number(meta?.page ?? 1),
    pageSize: Number(meta?.limit ?? meta?.pageSize ?? 20),
  };
}

function mongoId(raw: Record<string, unknown>): string {
  return String(raw._id ?? raw.id ?? "");
}

function titleCaseFromSnake(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function toApiEnum(value: string): string {
  return value
    .trim()
    .replace(/[+/]/g, " ")
    .replace(/\s+/g, "_")
    .toUpperCase();
}

const FIRM_TITLE_DISPLAY: Record<string, string> = {
  MANAGING_PARTNER: "Managing Partner",
  SENIOR_PARTNER: "Senior Partner",
  PARTNER: "Partner",
  ASSOCIATE: "Associate",
  SENIOR_ASSOCIATE: "Senior Associate",
  JUNIOR_ASSOCIATE: "Junior Associate",
  LITIGATION_LAWYER: "Litigation Lawyer",
  CORPORATE_LAWYER: "Corporate Lawyer",
  INTERN: "Intern",
  LAW_CLERK: "Law Clerk",
  LEGAL_RESEARCHER: "Legal Researcher",
  PARALEGAL: "Paralegal",
  RECOVERY: "Recovery",
  DOCUMENTATION: "Documentation",
  RECEPTION: "Reception",
  FINANCE: "Finance",
  HR: "HR",
  EXTERNAL_COUNSEL: "External Counsel",
};

const FIRM_TITLE_API: Record<string, string> = Object.fromEntries(
  Object.entries(FIRM_TITLE_DISPLAY).map(([api, display]) => [display.toLowerCase(), api])
);

const ACCESS_LEVEL_DISPLAY: Record<string, string> = {
  VIEW: "View Only",
  COMMENT: "View + Comment",
  EDIT: "Edit",
  APPROVE: "Approve",
  DELETE: "Delete",
  ASSIGN: "Assign",
  ARCHIVE: "Archive",
  EXPORT: "Export",
  PRINT: "Print",
  BILLING: "Billing Access",
  EVIDENCE: "Evidence Access",
  RESEARCH: "Legal Research Access",
  ADMIN: "Administration",
  SUPER_ADMIN: "Super Admin",
};

const ACCESS_LEVEL_API: Record<string, string> = Object.fromEntries(
  Object.entries(ACCESS_LEVEL_DISPLAY).map(([api, display]) => [display.toLowerCase(), api])
);

const MATTER_ROLE_DISPLAY: Record<string, string> = {
  LEAD_ADVOCATE: "Lead Advocate",
  CO_COUNSEL: "Co-Counsel",
  RESEARCH_LAWYER: "Research Lawyer",
  DRAFTING_LAWYER: "Drafting Lawyer",
  COURT_APPEARANCE_LAWYER: "Court Appearance Lawyer",
  CLERK: "Clerk",
  PARALEGAL: "Paralegal",
  CLIENT_RELATIONSHIP_MANAGER: "Client Relationship Manager",
  RECOVERY_OFFICER: "Recovery Officer",
  DOCUMENT_CONTROLLER: "Document Controller",
};

const MATTER_ROLE_API: Record<string, string> = Object.fromEntries(
  Object.entries(MATTER_ROLE_DISPLAY).map(([api, display]) => [display.toLowerCase(), api])
);

const WAR_ROOM_TYPE_DISPLAY: Record<string, string> = {
  DISCUSSION: "Discussion",
  INTERNAL_NOTE: "Notes",
  PRIVATE_MESSAGE: "Private",
  STRATEGY: "Strategy",
  ARGUMENT: "Argument",
  COUNTER_ARGUMENT: "Counter",
  EVIDENCE_NOTE: "Evidence Note",
  WITNESS_NOTE: "Witness",
  RESEARCH: "Research",
  JUDGMENT_LINK: "Links",
  LINK: "Links",
  MEETING_NOTE: "Meetings",
  VOICE_NOTE: "Voice",
  ACTION: "Action",
};

const WAR_ROOM_TYPE_API: Record<string, string> = {
  discussion: "DISCUSSION",
  notes: "INTERNAL_NOTE",
  strategy: "STRATEGY",
  argument: "ARGUMENT",
  counter: "COUNTER_ARGUMENT",
  "evidence note": "EVIDENCE_NOTE",
  witness: "WITNESS_NOTE",
  research: "RESEARCH",
  links: "LINK",
  meetings: "MEETING_NOTE",
};

const TIME_ACTIVITY_DISPLAY: Record<string, string> = {
  RESEARCH: "Research",
  DRAFTING: "Drafting",
  COURT: "Court",
  TRAVEL: "Travel",
  CLIENT_MEETING: "Meeting",
  PHONE: "Phone",
  VIDEO: "Video",
  OTHER: "Other",
};

const TIME_ACTIVITY_API: Record<string, string> = {
  research: "RESEARCH",
  drafting: "DRAFTING",
  court: "COURT",
  travel: "TRAVEL",
  meeting: "CLIENT_MEETING",
  "client meeting": "CLIENT_MEETING",
  phone: "PHONE",
  video: "VIDEO",
  other: "OTHER",
};

const WORKFLOW_STEP_DISPLAY: Record<string, string> = {
  INTERN: "Intern",
  JUNIOR: "Junior Associate",
  SENIOR: "Senior Associate",
  PARTNER: "Partner",
  CLIENT: "Client Approval",
  FILING: "Court Filing",
  DONE: "Done",
};

const DEFAULT_WORKFLOW_STEPS = [
  "Intern",
  "Junior Associate",
  "Senior Associate",
  "Partner",
  "Client Approval",
  "Court Filing",
];

export type OrgBranch = Branch & { code?: string; state?: string; active?: boolean };

export type OrgMember = FirmStaff & {
  userId?: string;
  branchId?: string;
  accessLevels?: string[];
};

export type CaseAclEntry = {
  id: string;
  userId: string;
  levels: string[];
  grantedBy?: string;
};

export type MatterTeamMember = {
  id: string;
  userId: string;
  role: string;
  responsibilities?: string;
  active?: boolean;
};

export type WarRoomEntry = {
  id: string;
  type: string;
  author: string;
  body: string;
  title?: string;
  pinned: boolean;
  at: string;
};

export type ConflictCheckResult = {
  id: string;
  score: number;
  risk?: string;
  matches: { name: string; reason: string; strength: number }[];
  title?: string;
};

export type RelationshipGraph = {
  caseId?: string;
  nodes: { id: string; label: string; type: string }[];
  edges: { from: string; to: string; label: string }[];
};

export type TimeEntryRow = {
  id: string;
  matter: string;
  activity: string;
  minutes: number;
  billable: boolean;
  when: string;
  by: string;
  caseId?: string;
  notes?: string;
};

export type WorkflowRow = {
  id: string;
  title: string;
  matter: string;
  step: string;
  steps: string[];
  caseId?: string;
  history: { at: string; step: string; note: string }[];
};

function mapBranch(raw: Record<string, unknown>): OrgBranch {
  return {
    id: mongoId(raw),
    name: String(raw.name ?? ""),
    code: raw.code ? String(raw.code) : undefined,
    city: String(raw.city ?? ""),
    state: raw.state ? String(raw.state) : undefined,
    isHeadOffice: Boolean(raw.isHeadOffice),
    staffCount: Number(raw.staffCount ?? 0),
    active: raw.active === undefined ? true : Boolean(raw.active),
  };
}

function mapMember(raw: Record<string, unknown>): OrgMember {
  const userId = String(raw.userId ?? "");
  const titleRaw = String(raw.title ?? "");
  const deptRaw = String(raw.department ?? "");
  return {
    id: mongoId(raw) || userId,
    userId,
    name: String((raw.name ?? userId) || "Member"),
    title: FIRM_TITLE_DISPLAY[titleRaw] ?? (titleCaseFromSnake(titleRaw) || titleRaw),
    department: titleCaseFromSnake(deptRaw) || deptRaw,
    branch: String(raw.branchName ?? raw.branch ?? ""),
    branchId: raw.branchId ? String(raw.branchId) : undefined,
    email: String(raw.email ?? (userId.includes("@") ? userId : "")),
    accessLevels: Array.isArray(raw.accessLevels)
      ? (raw.accessLevels as string[]).map((l) => ACCESS_LEVEL_DISPLAY[l] ?? l)
      : [],
  };
}

function mapAclEntry(raw: Record<string, unknown>): CaseAclEntry {
  return {
    id: mongoId(raw),
    userId: String(raw.userId ?? ""),
    levels: Array.isArray(raw.levels)
      ? (raw.levels as string[]).map((l) => ACCESS_LEVEL_DISPLAY[l] ?? l)
      : [],
    grantedBy: raw.grantedBy ? String(raw.grantedBy) : undefined,
  };
}

function mapMatterTeamMember(raw: Record<string, unknown>): MatterTeamMember {
  const roleRaw = String(raw.role ?? "");
  return {
    id: mongoId(raw),
    userId: String(raw.userId ?? ""),
    role: MATTER_ROLE_DISPLAY[roleRaw] ?? (titleCaseFromSnake(roleRaw) || roleRaw),
    responsibilities: raw.responsibilities ? String(raw.responsibilities) : undefined,
    active: raw.active === undefined ? true : Boolean(raw.active),
  };
}

function mapWarRoomEntry(raw: Record<string, unknown>): WarRoomEntry {
  const typeRaw = String(raw.type ?? "DISCUSSION");
  return {
    id: mongoId(raw),
    type: WAR_ROOM_TYPE_DISPLAY[typeRaw] ?? titleCaseFromSnake(typeRaw),
    author: String(raw.authorName ?? raw.authorId ?? raw.author ?? "Unknown"),
    body: String(raw.body ?? ""),
    title: raw.title ? String(raw.title) : undefined,
    pinned: Boolean(raw.pinned),
    at: raw.createdAt
      ? new Date(String(raw.createdAt)).toISOString()
      : new Date().toISOString(),
  };
}

function mapConflictCheck(raw: Record<string, unknown>): ConflictCheckResult {
  const matches = Array.isArray(raw.matches)
    ? (raw.matches as Record<string, unknown>[]).map((m) => ({
        name: String(m.name ?? ""),
        reason: String(m.reason ?? ""),
        strength: Number(m.strength ?? 0),
      }))
    : [];
  return {
    id: mongoId(raw),
    score: Number(raw.score ?? 0),
    risk: raw.risk ? String(raw.risk) : undefined,
    matches,
    title: raw.title ? String(raw.title) : undefined,
  };
}

function mapRelationshipGraph(raw: Record<string, unknown>): RelationshipGraph {
  const nodes = Array.isArray(raw.nodes)
    ? (raw.nodes as Record<string, unknown>[]).map((n) => ({
        id: String(n.id ?? ""),
        label: String(n.label ?? ""),
        type: titleCaseFromSnake(String(n.type ?? "Node")),
      }))
    : [];
  const edges = Array.isArray(raw.edges)
    ? (raw.edges as Record<string, unknown>[]).map((e) => ({
        from: String(e.from ?? ""),
        to: String(e.to ?? ""),
        label: String(e.label ?? e.relation ?? ""),
      }))
    : [];
  return {
    caseId: raw.caseId ? String(raw.caseId) : undefined,
    nodes,
    edges,
  };
}

function mapTimeEntry(raw: Record<string, unknown>): TimeEntryRow {
  const activityRaw = String(raw.activity ?? "OTHER");
  const occurred = raw.occurredAt ? new Date(String(raw.occurredAt)) : new Date();
  return {
    id: mongoId(raw),
    matter: String(raw.matterTitle ?? raw.caseNumber ?? raw.caseId ?? "—"),
    activity: TIME_ACTIVITY_DISPLAY[activityRaw] ?? titleCaseFromSnake(activityRaw),
    minutes: Number(raw.minutes ?? 0),
    billable: raw.billable === undefined ? true : Boolean(raw.billable),
    when: occurred.toISOString().slice(0, 10),
    by: String(raw.userName ?? raw.userId ?? "—"),
    caseId: raw.caseId ? String(raw.caseId) : undefined,
    notes: raw.notes ? String(raw.notes) : undefined,
  };
}

function mapWorkflow(raw: Record<string, unknown>): WorkflowRow {
  const stepRaw = String(raw.currentStep ?? raw.step ?? "INTERN");
  const step = WORKFLOW_STEP_DISPLAY[stepRaw] ?? titleCaseFromSnake(stepRaw);
  const versions = Array.isArray(raw.versions) ? (raw.versions as Record<string, unknown>[]) : [];
  const history =
    versions.length > 0
      ? versions.map((v, i) => ({
          at: v.createdAt
            ? new Date(String(v.createdAt)).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10),
          step: i === versions.length - 1 ? step : DEFAULT_WORKFLOW_STEPS[Math.min(i, DEFAULT_WORKFLOW_STEPS.length - 1)],
          note: v.approvedBy ? "Approved" : i === versions.length - 1 ? "Current step" : "Submitted",
        }))
      : [
          {
            at: raw.createdAt
              ? new Date(String(raw.createdAt)).toISOString().slice(0, 10)
              : new Date().toISOString().slice(0, 10),
            step,
            note: "Current step",
          },
        ];

  return {
    id: mongoId(raw),
    title: String(raw.title ?? "Workflow"),
    matter: String(raw.matterTitle ?? raw.caseNumber ?? raw.caseId ?? "—"),
    step,
    steps: DEFAULT_WORKFLOW_STEPS,
    caseId: raw.caseId ? String(raw.caseId) : undefined,
    history,
  };
}

export function toFirmTitleApi(displayOrApi: string): string {
  return FIRM_TITLE_API[displayOrApi.toLowerCase()] ?? toApiEnum(displayOrApi);
}

export function toAccessLevelApi(displayOrApi: string): string {
  return ACCESS_LEVEL_API[displayOrApi.toLowerCase()] ?? toApiEnum(displayOrApi);
}

export function toMatterRoleApi(displayOrApi: string): string {
  return MATTER_ROLE_API[displayOrApi.toLowerCase()] ?? toApiEnum(displayOrApi);
}

export function toWarRoomTypeApi(displayOrApi: string): string {
  return WAR_ROOM_TYPE_API[displayOrApi.toLowerCase()] ?? toApiEnum(displayOrApi);
}

export function toTimeActivityApi(displayOrApi: string): string {
  return TIME_ACTIVITY_API[displayOrApi.toLowerCase()] ?? toApiEnum(displayOrApi);
}

export function toDepartmentApi(displayOrApi: string): string {
  const key = toApiEnum(displayOrApi);
  const allowed = [
    "LITIGATION",
    "CORPORATE",
    "RECOVERY",
    "DOCUMENTATION",
    "RESEARCH",
    "FINANCE",
    "HR",
    "ADMIN",
    "GENERAL",
  ];
  return allowed.includes(key) ? key : "GENERAL";
}

function slugCode(name: string): string {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 32) || "BRANCH";
}

async function fetchNotificationFeed(params?: { unreadOnly?: boolean }) {
  return withMockFallback(async () => {
    const query = new URLSearchParams();
    if (params?.unreadOnly) query.set("unreadOnly", "true");
    const { data, meta } = await fetchEnvelope<Record<string, unknown>[]>(
      `/notifications/feed?${query}`
    );
    return toPaginated((data ?? []).map(mapNotification), meta);
  }, { data: mockNotifications, total: mockNotifications.length, page: 1, pageSize: 20 });
}

export const legalApi = {
  getDashboard: () =>
    withMockFallback(async () => {
      const { data } = await fetchEnvelope<PortfolioRaw>("/dashboard");
      return mapPortfolio(data, mockDashboard);
    }, mockDashboard),

  getCases: (params?: { status?: string; page?: number }) =>
    withMockFallback(async () => {
      const query = new URLSearchParams();
      if (params?.status) query.set("status", params.status.toUpperCase());
      if (params?.page) query.set("page", String(params.page));
      const { data, meta } = await fetchEnvelope<Record<string, unknown>[]>(`/cases?${query}`);
      return toPaginated((data ?? []).map(mapCase), meta);
    }, {
      data: mockCases,
      total: mockCases.length,
      page: 1,
      pageSize: 20,
    }),

  getCaseById: (id: string) =>
    withMockFallback(async () => {
      const { data } = await fetchEnvelope<Record<string, unknown>>(`/cases/${id}`);
      return mapCase(data);
    }, getMockCaseById(id) ?? mockCases[0]),

  getComplaints: () =>
    withMockFallback(async () => {
      const { data, meta } = await fetchEnvelope<Record<string, unknown>[]>("/complaints");
      return toPaginated((data ?? []).map(mapComplaint), meta);
    }, { data: mockComplaints, total: mockComplaints.length, page: 1, pageSize: 20 }),

  getComplaintById: (id: string) =>
    withMockFallback(async () => {
      const { data } = await fetchEnvelope<Record<string, unknown>>(`/complaints/${id}`);
      return mapComplaint(data);
    }, getMockComplaintById(id) ?? mockComplaints[0]),

  updateComplaint: async (
    id: string,
    input: {
      status?: string;
      nextFollowUpAt?: string | null;
      escalation?: boolean;
      notes?: string;
    }
  ) => {
    try {
      const body: Record<string, unknown> = { ...input };
      if (input.status) body.status = input.status.toUpperCase();
      const { data } = await fetchEnvelope<Record<string, unknown>>(`/complaints/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      return mapComplaint(data);
    } catch {
      const existing = getMockComplaintById(id) ?? mockComplaints[0];
      return {
        ...existing,
        nextFollowUpAt: input.nextFollowUpAt ?? existing.nextFollowUpAt,
        status: input.escalation ? "under_inquiry" as const : existing.status,
      };
    }
  },

  convertComplaintToFir: async (id: string, policeStation = "Local PS") => {
    try {
      const { data } = await fetchEnvelope<
        Record<string, unknown> | { fir: Record<string, unknown>; complaint?: Record<string, unknown> }
      >(`/complaints/${id}/convert-to-fir`, {
        method: "POST",
        body: JSON.stringify({
          firNumber: `${Math.floor(Math.random() * 900) + 100}/${new Date().getFullYear()}`,
          policeStation,
        }),
      });
      const firDoc =
        data && typeof data === "object" && "fir" in data
          ? (data.fir as Record<string, unknown>)
          : (data as Record<string, unknown>);
      return mapFir(firDoc);
    } catch {
      const complaint = getMockComplaintById(id);
      const newFir: Fir = {
        id: `fir-new-${Date.now()}`,
        firNumber: `${Math.floor(Math.random() * 900) + 100}/${new Date().getFullYear()}`,
        sections: ["420 IPC"],
        policeStation: complaint?.policeStation ?? policeStation,
        district: complaint?.district ?? "Delhi",
        complainant: complaint?.complainant ?? "Unknown",
        status: "registered",
        registeredAt: new Date().toISOString(),
        investigatingOfficer: "Assigned on conversion",
        linkedComplaintId: id,
        summary: complaint?.description ?? "Converted from complaint register.",
      };
      return newFir;
    }
  },

  getFirs: () =>
    withMockFallback(async () => {
      const { data, meta } = await fetchEnvelope<Record<string, unknown>[]>("/firs");
      return toPaginated((data ?? []).map(mapFir), meta);
    }, { data: mockFirs, total: mockFirs.length, page: 1, pageSize: 20 }),

  getFirById: (id: string) =>
    withMockFallback(async () => {
      const { data } = await fetchEnvelope<Record<string, unknown>>(`/firs/${id}`);
      return mapFir(data);
    }, getMockFirById(id) ?? mockFirs[0]),

  updateFir: async (
    id: string,
    input: {
      status?: string;
      bailStatus?: string;
      chargeSheet?: { filedAt?: string; referenceNumber?: string; notes?: string };
      investigationOfficer?: string;
      summary?: string;
    }
  ) => {
    try {
      const body: Record<string, unknown> = { ...input };
      if (input.status) body.status = input.status.toUpperCase();
      if (input.bailStatus) body.bailStatus = input.bailStatus.toUpperCase();
      const { data } = await fetchEnvelope<Record<string, unknown>>(`/firs/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      return mapFir(data);
    } catch {
      const existing = getMockFirById(id) ?? mockFirs[0];
      return { ...existing, ...input, status: (input.status as Fir["status"]) ?? existing.status };
    }
  },

  getHearings: (params?: { from?: string; to?: string; caseId?: string; q?: string }) =>
    withMockFallback(async () => {
      const query = new URLSearchParams();
      if (params?.from) query.set("from", params.from);
      if (params?.to) query.set("to", params.to);
      if (params?.caseId) query.set("caseId", params.caseId);
      if (params?.q) query.set("q", params.q);
      const { data } = await fetchEnvelope<Record<string, unknown>[]>(`/hearings?${query}`);
      let items = (data ?? []).map(mapHearing);
      if (params?.q) {
        const needle = params.q.toLowerCase();
        items = items.filter(
          (h) =>
            h.caseNumber.toLowerCase().includes(needle) ||
            h.title.toLowerCase().includes(needle) ||
            h.court.toLowerCase().includes(needle) ||
            h.bench.toLowerCase().includes(needle)
        );
      }
      return items;
    }, filterHearingsByRange(mockHearings, params?.from, params?.to, params?.q)),

  getEvidence: () =>
    withMockFallback(async () => {
      const { data } = await fetchEnvelope<Record<string, unknown>[]>("/evidence");
      return (data ?? []).map(mapEvidence);
    }, mockEvidence),

  sealEvidence: async (id: string, input?: { sha256?: string; notes?: string }) => {
    try {
      const { data } = await fetchEnvelope<Record<string, unknown>>(`/evidence/${id}/seal`, {
        method: "POST",
        body: JSON.stringify(input ?? {}),
      });
      return mapEvidence(data);
    } catch {
      const item = mockEvidence.find((e) => e.id === id);
      if (item) return { ...item, status: "verified" as const, sealed: true };
      return { ...mockEvidence[0], id, status: "verified" as const, sealed: true };
    }
  },

  getFilings: (params?: { caseId?: string; status?: string }) =>
    withMockFallback(async () => {
      const query = new URLSearchParams();
      if (params?.caseId) query.set("caseId", params.caseId);
      if (params?.status) query.set("status", params.status.toUpperCase());
      const { data, meta } = await fetchEnvelope<Record<string, unknown>[]>(`/filings?${query}`);
      return toPaginated((data ?? []).map(mapFiling), meta);
    }, { data: mockFilings, total: mockFilings.length, page: 1, pageSize: 20 }),

  getFilingById: (id: string) =>
    withMockFallback(async () => {
      const { data } = await fetchEnvelope<Record<string, unknown>>(`/filings/${id}`);
      return mapFiling(data);
    }, getMockFilingById(id) ?? mockFilings[0]),

  createFiling: async (input: {
    caseId: string;
    title: string;
    filingType: string;
    status?: string;
    diaryNumber?: string;
  }) => {
    try {
      const { data } = await fetchEnvelope<Record<string, unknown>>("/filings", {
        method: "POST",
        body: JSON.stringify({
          ...input,
          filingType: input.filingType.toUpperCase(),
          status: input.status?.toUpperCase(),
        }),
      });
      return mapFiling(data);
    } catch {
      return {
        id: `fil-new-${Date.now()}`,
        caseId: input.caseId,
        title: input.title,
        filingType: input.filingType.toLowerCase() as Filing["filingType"],
        status: "draft" as const,
        diaryNumber: input.diaryNumber,
        createdAt: new Date().toISOString(),
      };
    }
  },

  updateFiling: async (
    id: string,
    input: { title?: string; status?: string; diaryNumber?: string }
  ) => {
    try {
      const body: Record<string, unknown> = { ...input };
      if (input.status) body.status = input.status.toUpperCase();
      const { data } = await fetchEnvelope<Record<string, unknown>>(`/filings/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      return mapFiling(data);
    } catch {
      const existing = getMockFilingById(id) ?? mockFilings[0];
      return {
        ...existing,
        ...input,
        status: (input.status as Filing["status"]) ?? existing.status,
      };
    }
  },

  getKnowledge: (params?: { category?: string; search?: string }) =>
    withMockFallback(async () => {
      const query = new URLSearchParams();
      if (params?.category) query.set("category", params.category.toUpperCase());
      const { data, meta } = await fetchEnvelope<Record<string, unknown>[]>(`/knowledge?${query}`);
      let items = (data ?? []).map(mapKnowledgeDoc);
      if (params?.search) {
        const q = params.search.toLowerCase();
        items = items.filter(
          (d) =>
            d.title.toLowerCase().includes(q) ||
            d.body.toLowerCase().includes(q) ||
            d.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return toPaginated(items, meta);
    }, { data: mockKnowledge, total: mockKnowledge.length, page: 1, pageSize: 20 }),

  createKnowledge: async (input: {
    title: string;
    category: string;
    body: string;
    tags?: string[];
  }) => {
    try {
      const { data } = await fetchEnvelope<Record<string, unknown>>("/knowledge", {
        method: "POST",
        body: JSON.stringify({ ...input, category: input.category.toUpperCase() }),
      });
      return mapKnowledgeDoc(data);
    } catch {
      return {
        id: `kb-new-${Date.now()}`,
        title: input.title,
        category: input.category.toLowerCase() as KnowledgeDoc["category"],
        body: input.body,
        tags: input.tags ?? [],
        bookmarked: false,
        createdAt: new Date().toISOString(),
      };
    }
  },

  updateKnowledge: async (
    id: string,
    input: { title?: string; category?: string; body?: string; tags?: string[] }
  ) => {
    try {
      const body: Record<string, unknown> = { ...input };
      if (input.category) body.category = input.category.toUpperCase();
      const { data } = await fetchEnvelope<Record<string, unknown>>(`/knowledge/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      return mapKnowledgeDoc(data);
    } catch {
      const doc = mockKnowledge.find((d) => d.id === id) ?? mockKnowledge[0];
      return {
        ...doc,
        ...input,
        category: (input.category?.toLowerCase() as KnowledgeDoc["category"]) ?? doc.category,
      };
    }
  },

  bookmarkKnowledge: async (id: string) => {
    try {
      const { data } = await fetchEnvelope<Record<string, unknown>>(`/knowledge/${id}/bookmark`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      return mapKnowledgeDoc(data);
    } catch {
      const doc = mockKnowledge.find((d) => d.id === id) ?? mockKnowledge[0];
      return { ...doc, bookmarked: !doc.bookmarked };
    }
  },

  getNotificationFeed: fetchNotificationFeed,

  getNotifications: fetchNotificationFeed,

  getProviderCapabilities: () =>
    withMockFallback(async () => {
      const { data } = await fetchEnvelope<Array<{ provider: string; capabilities: string[] }>>(
        "/providers/capabilities"
      );
      return mapProviderCapabilities(data ?? []);
    }, mockProviders.map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status,
      enabled: p.enabled,
      description: p.description,
      capabilities: ["sync", "lookup"],
      lastSync: p.lastSync,
    }))),

  createAiRequest: async (input: {
    task: AiTask;
    prompt?: string;
    caseId?: string;
    redact?: boolean;
  }): Promise<AiRequestResult> => {
    try {
      const { data } = await fetchEnvelope<Record<string, unknown>>("/ai/requests", {
        method: "POST",
        body: JSON.stringify({
          task: input.task.toUpperCase(),
          prompt: input.prompt,
          caseId: input.caseId,
          redact: input.redact ?? true,
        }),
      });
      return mapAiRequest(data);
    } catch {
      return {
        id: `ai-${Date.now()}`,
        task: input.task,
        result: `[${input.task}] Preview response — attorney review required before filing or sending.\n\n${input.prompt ?? ""}`,
        model: "local-template",
        reviewRequired: true,
        citations: [],
      };
    }
  },

  createCase: async (input: {
    title: string;
    caseNumber?: string;
    practiceArea: string;
    status?: string;
    court?: { name?: string; judgeName?: string; state?: string; district?: string; courtNumber?: string; cino?: string };
    summary?: string;
    nextHearingAt?: string;
  }) => {
    const { data } = await fetchEnvelope<Record<string, unknown>>("/cases", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return mapCase(data);
  },

  createComplaint: async (input: {
    complaintNumber: string;
    category: string;
    status?: string;
    policeStation?: string;
    location?: string;
    description?: string;
  }) => {
    const { data } = await fetchEnvelope<Record<string, unknown>>("/complaints", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return mapComplaint(data);
  },

  scheduleHearing: async (
    caseId: string,
    input: {
      title: string;
      scheduledAt: string;
      purpose?: string;
      court?: { name?: string; judgeName?: string; courtNumber?: string; bench?: string };
      notes?: string;
    }
  ) => {
    const { data } = await fetchEnvelope<Record<string, unknown>>(`/cases/${caseId}/hearings`, {
      method: "POST",
      body: JSON.stringify(input),
    });
    return mapHearing(data);
  },

  registerEvidence: async (input: {
    title: string;
    description?: string;
    mediaType: string;
    mimeType: string;
    sizeBytes: number;
    filename: string;
    caseId?: string;
    complaintId?: string;
    firId?: string;
  }) => {
    const { data } = await fetchEnvelope<{
      evidence: Record<string, unknown>;
      upload: { key: string; uploadUrl: string; bucket?: string; expiresAt?: string };
    }>("/evidence/upload-intents", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return {
      evidence: mapEvidence(data.evidence),
      upload: data.upload,
    };
  },

  listBranches: () =>
    withMockFallback(async () => {
      const { data } = await fetchEnvelope<Record<string, unknown>[]>("/org/branches");
      return (data ?? []).map(mapBranch);
    }, mockBranches),

  createBranch: async (input: {
    name: string;
    code: string;
    city?: string;
    state?: string;
    isHeadOffice?: boolean;
  }) => {
    try {
      const { data } = await fetchEnvelope<Record<string, unknown>>("/org/branches", {
        method: "POST",
        body: JSON.stringify(input),
      });
      return mapBranch(data);
    } catch {
      return {
        id: `b${Date.now()}`,
        name: input.name,
        code: input.code,
        city: input.city ?? "",
        state: input.state,
        isHeadOffice: input.isHeadOffice ?? false,
        staffCount: 0,
      } satisfies OrgBranch;
    }
  },

  listMembers: () =>
    withMockFallback(async () => {
      const { data } = await fetchEnvelope<Record<string, unknown>[]>("/org/members");
      return (data ?? []).map(mapMember);
    }, mockStaff),

  upsertMember: async (input: {
    userId: string;
    title: string;
    department: string;
    branchId?: string;
    accessLevels?: string[];
  }) => {
    try {
      const { data } = await fetchEnvelope<Record<string, unknown>>("/org/members", {
        method: "POST",
        body: JSON.stringify({
          userId: input.userId,
          title: toFirmTitleApi(input.title),
          department: toDepartmentApi(input.department),
          branchId: input.branchId,
          accessLevels: (input.accessLevels ?? []).map(toAccessLevelApi),
        }),
      });
      return mapMember(data);
    } catch {
      return {
        id: `s${Date.now()}`,
        userId: input.userId,
        name: input.userId,
        title: FIRM_TITLE_DISPLAY[toFirmTitleApi(input.title)] ?? input.title,
        department: input.department,
        branch: "",
        branchId: input.branchId,
        email: input.userId.includes("@") ? input.userId : "",
        accessLevels: input.accessLevels ?? [],
      } satisfies OrgMember;
    }
  },

  getCaseAcl: (caseId: string) =>
    withMockFallback(async () => {
      const { data } = await fetchEnvelope<Record<string, unknown>[]>(`/cases/${caseId}/acl`);
      return (data ?? []).map(mapAclEntry);
    }, [] as CaseAclEntry[]),

  setCaseAcl: async (caseId: string, input: { entries: { userId: string; levels: string[] }[] }) => {
    try {
      const { data } = await fetchEnvelope<Record<string, unknown>[]>(`/cases/${caseId}/acl`, {
        method: "PUT",
        body: JSON.stringify({
          entries: input.entries.map((e) => ({
            userId: e.userId,
            levels: e.levels.map(toAccessLevelApi),
          })),
        }),
      });
      return (data ?? []).map(mapAclEntry);
    } catch {
      return input.entries.map((e, i) => ({
        id: `acl-${i}`,
        userId: e.userId,
        levels: e.levels,
      }));
    }
  },

  listMatterTeam: (caseId: string) =>
    withMockFallback(async () => {
      const { data } = await fetchEnvelope<Record<string, unknown>[]>(`/cases/${caseId}/team`);
      return (data ?? []).map(mapMatterTeamMember);
    }, [] as MatterTeamMember[]),

  upsertMatterTeamMember: async (
    caseId: string,
    input: { userId: string; role: string; responsibilities?: string }
  ) => {
    try {
      const { data } = await fetchEnvelope<Record<string, unknown>>(`/cases/${caseId}/team`, {
        method: "POST",
        body: JSON.stringify({
          userId: input.userId,
          role: toMatterRoleApi(input.role),
          responsibilities: input.responsibilities,
        }),
      });
      return mapMatterTeamMember(data);
    } catch {
      return {
        id: `tm-${Date.now()}`,
        userId: input.userId,
        role: MATTER_ROLE_DISPLAY[toMatterRoleApi(input.role)] ?? input.role,
        responsibilities: input.responsibilities,
        active: true,
      } satisfies MatterTeamMember;
    }
  },

  listWarRoom: (caseId: string) =>
    withMockFallback(async () => {
      const { data } = await fetchEnvelope<Record<string, unknown>[]>(`/cases/${caseId}/war-room`);
      return (data ?? []).map(mapWarRoomEntry);
    }, mockWarRoomFeed),

  createWarRoomEntry: async (
    caseId: string,
    input: { type: string; body: string; title?: string; pinned?: boolean }
  ) => {
    try {
      const { data } = await fetchEnvelope<Record<string, unknown>>(`/cases/${caseId}/war-room`, {
        method: "POST",
        body: JSON.stringify({
          type: toWarRoomTypeApi(input.type),
          body: input.body,
          title: input.title,
          pinned: input.pinned,
        }),
      });
      return mapWarRoomEntry(data);
    } catch {
      return {
        id: `w-local-${Date.now()}`,
        type: WAR_ROOM_TYPE_DISPLAY[toWarRoomTypeApi(input.type)] ?? input.type,
        author: "You",
        body: input.body,
        title: input.title,
        pinned: input.pinned ?? false,
        at: new Date().toISOString(),
      } satisfies WarRoomEntry;
    }
  },

  runConflictCheck: async (input: { partyNames: string[]; title?: string }) => {
    try {
      const { data } = await fetchEnvelope<Record<string, unknown>>("/conflict-checks", {
        method: "POST",
        body: JSON.stringify(input),
      });
      return mapConflictCheck(data);
    } catch {
      return {
        id: `cc-${Date.now()}`,
        score: Math.max(...mockConflictMatches.map((m) => m.strength)),
        matches: mockConflictMatches,
        title: input.title,
      } satisfies ConflictCheckResult;
    }
  },

  getRelationshipGraph: (caseId: string) =>
    withMockFallback(async () => {
      const { data } = await fetchEnvelope<Record<string, unknown>>(`/cases/${caseId}/graph`);
      return mapRelationshipGraph(data);
    }, mockGraph),

  listTimeEntries: (params?: { caseId?: string; userId?: string }) =>
    withMockFallback(async () => {
      const query = new URLSearchParams();
      if (params?.caseId) query.set("caseId", params.caseId);
      if (params?.userId) query.set("userId", params.userId);
      const qs = query.toString();
      const { data } = await fetchEnvelope<Record<string, unknown>[]>(
        `/time-entries${qs ? `?${qs}` : ""}`
      );
      return (data ?? []).map(mapTimeEntry);
    }, mockTimeEntries),

  createTimeEntry: async (input: {
    activity: string;
    minutes: number;
    billable?: boolean;
    occurredAt: string;
    caseId?: string;
    notes?: string;
  }) => {
    try {
      const { data } = await fetchEnvelope<Record<string, unknown>>("/time-entries", {
        method: "POST",
        body: JSON.stringify({
          activity: toTimeActivityApi(input.activity),
          minutes: input.minutes,
          billable: input.billable,
          occurredAt: input.occurredAt,
          caseId: input.caseId,
          notes: input.notes,
        }),
      });
      return mapTimeEntry(data);
    } catch {
      return {
        id: `t${Date.now()}`,
        matter: input.caseId ?? "—",
        activity: TIME_ACTIVITY_DISPLAY[toTimeActivityApi(input.activity)] ?? input.activity,
        minutes: input.minutes,
        billable: input.billable ?? true,
        when: input.occurredAt.slice(0, 10),
        by: "You",
        caseId: input.caseId,
        notes: input.notes,
      } satisfies TimeEntryRow;
    }
  },

  listWorkflows: (params?: { caseId?: string }) =>
    withMockFallback(async () => {
      const query = new URLSearchParams();
      if (params?.caseId) query.set("caseId", params.caseId);
      const qs = query.toString();
      const { data } = await fetchEnvelope<Record<string, unknown>[]>(
        `/workflows${qs ? `?${qs}` : ""}`
      );
      return (data ?? []).map(mapWorkflow);
    }, mockWorkflows.map((w) => {
      const idx = w.steps.indexOf(w.step);
      return {
        ...w,
        history: w.steps.slice(0, Math.max(idx, 0) + 1).map((step, i) => ({
          at: `2026-07-${String(10 + i).padStart(2, "0")}`,
          step,
          note: i === idx ? "Current step" : "Approved",
        })),
      } satisfies WorkflowRow;
    })),

  createWorkflow: async (input: {
    caseId: string;
    title: string;
    body: string;
    currentStep?: string;
  }) => {
    try {
      const { data } = await fetchEnvelope<Record<string, unknown>>("/workflows", {
        method: "POST",
        body: JSON.stringify(input),
      });
      return mapWorkflow(data);
    } catch {
      return {
        id: `d${Date.now()}`,
        title: input.title,
        matter: input.caseId,
        caseId: input.caseId,
        step: "Intern",
        steps: DEFAULT_WORKFLOW_STEPS,
        history: [
          {
            at: new Date().toISOString().slice(0, 10),
            step: "Intern",
            note: "Current step",
          },
        ],
      } satisfies WorkflowRow;
    }
  },

  advanceWorkflow: async (id: string, input?: { body?: string; approve?: boolean }) => {
    try {
      const { data } = await fetchEnvelope<Record<string, unknown>>(`/workflows/${id}/advance`, {
        method: "POST",
        body: JSON.stringify(input ?? { approve: true }),
      });
      return mapWorkflow(data);
    } catch {
      const existing = mockWorkflows.find((w) => w.id === id) ?? mockWorkflows[0];
      const idx = existing.steps.indexOf(existing.step);
      const nextStep =
        idx >= 0 && idx < existing.steps.length - 1 ? existing.steps[idx + 1] : existing.step;
      return {
        ...existing,
        step: nextStep,
        history: [
          {
            at: new Date().toISOString().slice(0, 10),
            step: nextStep,
            note: "Advanced locally",
          },
        ],
      } satisfies WorkflowRow;
    }
  },
};

export { slugCode };
export type { Case, Complaint, DashboardData, EvidenceItem, Fir, Hearing, PaginatedResponse };
export { API_BASE, ApiError };
