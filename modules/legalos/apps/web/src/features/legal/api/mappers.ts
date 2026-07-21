import type {
  AiTask,
  BailStatus,
  Case,
  CaseStage,
  Complaint,
  ComplaintStatus,
  DashboardData,
  EvidenceItem,
  Filing,
  FilingStatus,
  FilingType,
  Fir,
  FirStatus,
  Hearing,
  KnowledgeCategory,
  KnowledgeDoc,
  LegalNotification,
  MatterStatus,
  ProviderCapabilityInfo,
  ProviderId,
  ProviderStatus,
} from "../types";

type MongoDoc = Record<string, unknown> & {
  _id?: string | { toString(): string };
  id?: string;
};

function idOf(doc: MongoDoc): string {
  if (doc.id) return String(doc.id);
  if (doc._id) return String(doc._id);
  return "";
}

function asString(value: unknown, fallback = ""): string {
  if (value == null) return fallback;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function asIso(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (value instanceof Date) return value.toISOString();
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

const caseStatusMap: Record<string, MatterStatus> = {
  ACTIVE: "active",
  PENDING: "pending",
  DISPOSED: "disposed",
  STAYED: "pending",
  TRANSFERRED: "active",
  ARCHIVED: "archived",
};

const complaintStatusMap: Record<string, ComplaintStatus> = {
  REGISTERED: "registered",
  UNDER_INVESTIGATION: "under_inquiry",
  ESCALATED: "under_inquiry",
  CLOSED: "closed",
  CONVERTED_TO_FIR: "converted_to_fir",
};

const firStatusMap: Record<string, FirStatus> = {
  REGISTERED: "registered",
  UNDER_INVESTIGATION: "investigation",
  CHARGE_SHEET_FILED: "chargesheet",
  CLOSED: "closed",
  TRANSFERRED_TO_COURT: "chargesheet",
};

const bailStatusMap: Record<string, BailStatus> = {
  NOT_APPLICABLE: "not_applicable",
  APPLIED: "applied",
  GRANTED: "granted",
  REJECTED: "rejected",
  EXPIRED: "expired",
};

const filingStatusMap: Record<string, FilingStatus> = {
  DRAFT: "draft",
  CHECKLIST: "checklist",
  FILED: "filed",
  DEFECT: "defect",
  REFILED: "refiled",
  REGISTERED: "registered",
};

const filingTypeMap: Record<string, FilingType> = {
  PETITION: "petition",
  APPLICATION: "application",
  REPLY: "reply",
  AFFIDAVIT: "affidavit",
  VAKALATNAMA: "vakalatnama",
  WRITTEN_STATEMENT: "written_statement",
  INTERIM_APPLICATION: "interim_application",
  OTHER: "other",
};

const knowledgeCategoryMap: Record<string, KnowledgeCategory> = {
  TEMPLATE: "template",
  ACT: "act",
  RULE: "rule",
  CIRCULAR: "circular",
  NOTIFICATION: "notification",
  SOP: "sop",
  DRAFT: "draft",
};

const aiTaskMap: Record<string, AiTask> = {
  JUDGMENT_SUMMARY: "judgment_summary",
  BARE_ACT_EXPLANATION: "bare_act_explanation",
  PETITION_DRAFT: "petition_draft",
  HEARING_PREP: "hearing_prep",
  RISK_ANALYSIS: "risk_analysis",
  TIMELINE: "timeline",
};

const providerIdMap: Record<string, ProviderId> = {
  ecourts: "ecourts",
  "scc-online": "scc",
  scc: "scc",
  manupatra: "manupatra",
};

const providerNames: Record<ProviderId, string> = {
  ecourts: "eCourts Services",
  scc: "SCC Online",
  manupatra: "Manupatra",
};

const providerDescriptions: Record<ProviderId, string> = {
  ecourts: "Official case status, cause list, orders — licensed API only",
  scc: "Licensed research adapter — case law and citator",
  manupatra: "Licensed research adapter — statutes and commentary",
};

function stageFromPractice(practiceArea: string): CaseStage {
  if (/bail/i.test(practiceArea)) return "admission";
  if (/writ|appeal|slp/i.test(practiceArea)) return "arguments";
  return "evidence";
}

export function mapCase(raw: MongoDoc): Case {
  const court = (raw.court ?? {}) as Record<string, unknown>;
  const status = caseStatusMap[asString(raw.status, "PENDING")] ?? "pending";
  return {
    id: idOf(raw),
    caseNumber: asString(raw.caseNumber, "—"),
    title: asString(raw.title, "Untitled matter"),
    court: asString(court.name, "Court TBD"),
    bench: asString(court.judgeName) || undefined,
    clientId: asString((raw.clientPartyIds as unknown[])?.[0], ""),
    clientName: asString(raw.partiesSearch, "Client").split(/\s+/)[0] || "Client",
    advocate: "Assigned advocate",
    status,
    stage: stageFromPractice(asString(raw.practiceArea, "Civil")),
    nextHearing: raw.nextHearingAt ? asIso(raw.nextHearingAt) : undefined,
    filingDate: asIso(raw.openedAt ?? raw.createdAt),
    category: asString(raw.practiceArea, "Civil"),
    cnrs: asString(court.cino) || undefined,
    priority: status === "active" ? "high" : "medium",
    lastOrder: asString(raw.summary) || undefined,
  };
}

export function mapComplaint(raw: MongoDoc): Complaint {
  return {
    id: idOf(raw),
    complaintNumber: asString(raw.complaintNumber, "—"),
    complainant: "Complainant",
    subject: asString(raw.description, asString(raw.category, "Complaint")).slice(0, 120),
    policeStation: asString(raw.policeStation, "Police Station"),
    district: "—",
    status: complaintStatusMap[asString(raw.status, "REGISTERED")] ?? "registered",
    registeredAt: asIso(raw.createdAt),
    category: asString(raw.category, "OTHER"),
    firId: raw.convertedFirId ? asString(raw.convertedFirId) : undefined,
    description: asString(raw.description, ""),
    nextFollowUpAt: raw.nextFollowUpAt ? asIso(raw.nextFollowUpAt) : undefined,
  };
}

export function mapFir(raw: MongoDoc): Fir {
  const acts = (raw.actsAndSections as Array<{ act?: string; sections?: string[] }>) ?? [];
  const sections = acts.flatMap((a) => a.sections ?? []).filter(Boolean);
  const chargeSheetRaw = raw.chargeSheet as Record<string, unknown> | undefined;
  return {
    id: idOf(raw),
    firNumber: asString(raw.firNumber, "—"),
    sections: sections.length ? sections : ["—"],
    policeStation: asString(raw.policeStation, "Police Station"),
    district: "—",
    complainant: "Complainant",
    status: firStatusMap[asString(raw.status, "REGISTERED")] ?? "registered",
    registeredAt: asIso(raw.registeredAt ?? raw.createdAt),
    investigatingOfficer: asString(raw.investigationOfficer, "IO TBD"),
    linkedComplaintId: raw.sourceComplaintId ? asString(raw.sourceComplaintId) : undefined,
    summary: asString(raw.summary, ""),
    bailStatus: raw.bailStatus
      ? bailStatusMap[asString(raw.bailStatus)] ?? "not_applicable"
      : undefined,
    chargeSheet: chargeSheetRaw
      ? {
          filedAt: chargeSheetRaw.filedAt ? asIso(chargeSheetRaw.filedAt) : undefined,
          referenceNumber: asString(chargeSheetRaw.referenceNumber) || undefined,
          notes: asString(chargeSheetRaw.notes) || undefined,
        }
      : undefined,
  };
}

export function mapHearing(raw: MongoDoc): Hearing {
  const court = (raw.court ?? {}) as Record<string, unknown>;
  return {
    id: idOf(raw),
    caseId: asString(raw.caseId),
    caseNumber: asString(raw.caseNumber, "—"),
    title: asString(raw.title, "Hearing"),
    court: asString(court.name, "Court"),
    bench: asString(court.judgeName, "Bench"),
    dateTime: asIso(raw.scheduledAt),
    type: /final/i.test(asString(raw.purpose)) ? "final" : "regular",
    advocate: "Assigned advocate",
  };
}

export function mapEvidence(raw: MongoDoc): EvidenceItem {
  const media = asString(raw.mediaType, "DOCUMENT").toLowerCase();
  const type =
    media.includes("image")
      ? "photo"
      : media.includes("video")
        ? "video"
        : media.includes("audio")
          ? "audio"
          : "document";
  const statusRaw = asString(raw.status, "PENDING_UPLOAD");
  const status =
    statusRaw === "SEALED" || statusRaw === "AVAILABLE"
      ? "verified"
      : statusRaw === "REJECTED"
        ? "rejected"
        : "pending";

  return {
    id: idOf(raw),
    caseId: asString(raw.caseId),
    caseNumber: "—",
    title: asString(raw.title, "Evidence"),
    type,
    uploadedAt: asIso(raw.createdAt ?? raw.receivedAt),
    hash: asString(raw.sha256, "pending"),
    size: raw.sizeBytes ? `${Math.round(Number(raw.sizeBytes) / 1024)} KB` : "—",
    status,
    uploadedBy: "Uploader",
    sealed: statusRaw === "SEALED",
  };
}

export function mapFiling(raw: MongoDoc): Filing {
  return {
    id: idOf(raw),
    caseId: asString(raw.caseId),
    caseNumber: asString(raw.caseNumber) || undefined,
    title: asString(raw.title, "Filing"),
    filingType: filingTypeMap[asString(raw.filingType, "OTHER")] ?? "other",
    status: filingStatusMap[asString(raw.status, "DRAFT")] ?? "draft",
    diaryNumber: asString(raw.diaryNumber) || undefined,
    courtFees: raw.courtFees != null ? Number(raw.courtFees) : undefined,
    stampDuty: raw.stampDuty != null ? Number(raw.stampDuty) : undefined,
    createdAt: asIso(raw.createdAt),
    updatedAt: raw.updatedAt ? asIso(raw.updatedAt) : undefined,
  };
}

export function mapKnowledgeDoc(raw: MongoDoc): KnowledgeDoc {
  const bookmarkedBy = (raw.bookmarkedBy as unknown[]) ?? [];
  return {
    id: idOf(raw),
    title: asString(raw.title, "Document"),
    category: knowledgeCategoryMap[asString(raw.category, "DRAFT")] ?? "draft",
    body: asString(raw.body, ""),
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
    bookmarked: bookmarkedBy.length > 0,
    createdAt: asIso(raw.createdAt),
    updatedAt: raw.updatedAt ? asIso(raw.updatedAt) : undefined,
  };
}

export function mapNotification(raw: MongoDoc): LegalNotification {
  const metadata = (raw.metadata ?? {}) as Record<string, unknown>;
  return {
    id: idOf(raw),
    title: asString(raw.title, "Notification"),
    message: asString(raw.message ?? raw.body, ""),
    type: asString(raw.type, "GENERAL"),
    read: raw.readAt != null,
    createdAt: asIso(raw.createdAt),
    href: asString(metadata.href) || undefined,
  };
}

export function mapAiRequest(raw: MongoDoc) {
  return {
    id: idOf(raw),
    task: aiTaskMap[asString(raw.task, "HEARING_PREP")] ?? "hearing_prep",
    result: asString(raw.result, "No result returned."),
    model: asString(raw.modelName) || asString(raw.model) || undefined,
    reviewRequired: raw.reviewRequired !== false,
    citations: Array.isArray(raw.citations) ? raw.citations.map(String) : [],
  };
}

export function mapProviderCapabilities(
  raw: Array<{ provider: string; capabilities: string[] }>
): ProviderCapabilityInfo[] {
  return raw.map((entry) => {
    const id = providerIdMap[entry.provider] ?? "ecourts";
    const hasCaps = entry.capabilities.length > 0;
    const status: ProviderStatus = hasCaps ? "connected" : "not_configured";
    return {
      id,
      name: providerNames[id],
      status,
      enabled: hasCaps,
      description: providerDescriptions[id],
      capabilities: entry.capabilities,
    };
  });
}

export type PortfolioRaw = {
  totals?: { cases?: number; complaints?: number; firs?: number; evidence?: number };
  pendingComplaints?: number;
  pendingFirs?: number;
  todaysHearings?: MongoDoc[];
  upcomingHearings?: MongoDoc[];
  caseStatusBreakdown?: Array<{ _id: string; count: number }>;
  practiceAreaBreakdown?: Array<{ _id: { practiceArea?: string; status?: string }; count: number }>;
  recentComplaints?: MongoDoc[];
  recentCases?: MongoDoc[];
  recentFirs?: MongoDoc[];
};

export function mapPortfolio(raw: PortfolioRaw, base: DashboardData): DashboardData {
  const statusCounts = Object.fromEntries(
    (raw.caseStatusBreakdown ?? []).map((row) => [row._id, row.count])
  );
  const activeMatters = statusCounts.ACTIVE ?? raw.totals?.cases ?? 0;
  const pendingMatters = statusCounts.PENDING ?? 0;
  const disposedMatters = statusCounts.DISPOSED ?? 0;

  const todaysHearings = (raw.todaysHearings ?? []).map(mapHearing);
  const upcomingHearings = (raw.upcomingHearings ?? []).map(mapHearing);
  const allHearings = [...todaysHearings, ...upcomingHearings];

  const causeList = allHearings.slice(0, 8).map((h, i) => ({
    id: h.id,
    itemNumber: i + 1,
    caseNumber: h.caseNumber,
    title: h.title,
    purpose: h.type,
    court: h.court,
    bench: h.bench,
    advocate: h.advocate,
    status: "listed" as const,
  }));

  const practiceAnalytics = Object.values(
    (raw.practiceAreaBreakdown ?? []).reduce<Record<string, { category: string; count: number }>>(
      (acc, row) => {
        const category = row._id?.practiceArea ?? "Other";
        acc[category] = acc[category] ?? { category, count: 0 };
        acc[category].count += row.count;
        return acc;
      },
      {}
    )
  );

  const liveCases = (raw.recentCases ?? []).map(mapCase);

  return {
    ...base,
    kpis: {
      ...base.kpis,
      activeMatters: activeMatters || base.kpis.activeMatters,
      pendingMatters: pendingMatters || base.kpis.pendingMatters,
      disposedThisMonth: disposedMatters || base.kpis.disposedThisMonth,
      pendingComplaints: raw.pendingComplaints ?? base.kpis.pendingComplaints,
      pendingFirs: raw.pendingFirs ?? base.kpis.pendingFirs,
    },
    todaysHearings: todaysHearings.length ? todaysHearings : base.todaysHearings,
    upcomingHearings: upcomingHearings.length ? upcomingHearings : base.upcomingHearings,
    causeList: causeList.length ? causeList : base.causeList,
    pendingMatters: liveCases.filter((c) => c.status === "pending").length
      ? liveCases.filter((c) => c.status === "pending")
      : liveCases.length
        ? liveCases
        : base.pendingMatters,
    complaints: (raw.recentComplaints ?? []).map(mapComplaint).length
      ? (raw.recentComplaints ?? []).map(mapComplaint)
      : base.complaints,
    pendingFirs: (raw.recentFirs ?? []).map(mapFir).length
      ? (raw.recentFirs ?? []).map(mapFir)
      : base.pendingFirs,
    practiceAnalytics: practiceAnalytics.length ? practiceAnalytics : base.practiceAnalytics,
    calendarEvents: allHearings.slice(0, 6).map((h) => ({
      id: h.id,
      title: h.title,
      date: h.dateTime,
      type: "hearing",
      court: h.court,
    })).length
      ? allHearings.slice(0, 6).map((h) => ({
          id: h.id,
          title: h.title,
          date: h.dateTime,
          type: "hearing",
          court: h.court,
        }))
      : base.calendarEvents,
  };
}
