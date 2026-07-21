export const CASE_STATUSES = [
  'ACTIVE',
  'PENDING',
  'DISPOSED',
  'STAYED',
  'TRANSFERRED',
  'ARCHIVED',
] as const;
export type CaseStatus = (typeof CASE_STATUSES)[number];

export const PRACTICE_AREAS = [
  'Civil',
  'Criminal',
  'Family',
  'Property',
  'Consumer',
  'Labour',
  'Company',
  'Arbitration',
  'Tax',
  'NCLT',
  'DRT',
  'NI_ACT',
  'MotorAccident',
  'CyberCrime',
  'IPR',
  'Constitutional',
  'Writ',
  'Appeal',
  'Revision',
  'TransferPetition',
  'SLP',
  'Bail',
  'AnticipatoryBail',
] as const;
export type PracticeArea = (typeof PRACTICE_AREAS)[number];

export const PARTY_TYPES = [
  'CorporateClient',
  'IndividualClient',
  'GovernmentClient',
  'FamilyMember',
  'OppositeParty',
  'Witness',
  'PoliceOfficer',
  'Advocate',
  'CourtStaff',
] as const;
export type PartyType = (typeof PARTY_TYPES)[number];

export const COMPLAINT_STATUSES = [
  'REGISTERED',
  'UNDER_INVESTIGATION',
  'ESCALATED',
  'CLOSED',
  'CONVERTED_TO_FIR',
] as const;
export type ComplaintStatus = (typeof COMPLAINT_STATUSES)[number];

export const COMPLAINT_CATEGORIES = [
  'THEFT',
  'ASSAULT',
  'FRAUD',
  'DOMESTIC_VIOLENCE',
  'CYBER',
  'PROPERTY_DISPUTE',
  'HARASSMENT',
  'OTHER',
] as const;
export type ComplaintCategory = (typeof COMPLAINT_CATEGORIES)[number];

export const FIR_STATUSES = [
  'REGISTERED',
  'UNDER_INVESTIGATION',
  'CHARGE_SHEET_FILED',
  'CLOSED',
  'TRANSFERRED_TO_COURT',
] as const;
export type FirStatus = (typeof FIR_STATUSES)[number];

export const BAIL_STATUSES = ['NOT_APPLICABLE', 'APPLIED', 'GRANTED', 'REJECTED', 'EXPIRED'] as const;
export type BailStatus = (typeof BAIL_STATUSES)[number];

export const HEARING_STATUSES = ['SCHEDULED', 'ADJOURNED', 'COMPLETED', 'CANCELLED'] as const;
export type HearingStatus = (typeof HEARING_STATUSES)[number];

export const EVIDENCE_STATUSES = [
  'PENDING_UPLOAD',
  'UPLOADED',
  'PROCESSING',
  'AVAILABLE',
  'SEALED',
  'REJECTED',
] as const;
export type EvidenceStatus = (typeof EVIDENCE_STATUSES)[number];

export const EVIDENCE_MEDIA_TYPES = [
  'IMAGE',
  'VIDEO',
  'AUDIO',
  'DOCUMENT',
  'CCTV',
  'CALL_RECORD',
  'GPS',
  'EMAIL',
  'WHATSAPP_EXPORT',
  'OTHER',
] as const;
export type EvidenceMediaType = (typeof EVIDENCE_MEDIA_TYPES)[number];

export const AI_TASKS = [
  'JUDGMENT_SUMMARY',
  'BARE_ACT_EXPLANATION',
  'PETITION_DRAFT',
  'HEARING_PREP',
  'RISK_ANALYSIS',
  'TIMELINE',
] as const;
export type AiTask = (typeof AI_TASKS)[number];

export const PROVIDER_IDS = ['ecourts', 'scc-online', 'manupatra'] as const;
export type ProviderId = (typeof PROVIDER_IDS)[number];

export const SYNC_STATUSES = ['PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED', 'DISABLED'] as const;
export type SyncStatus = (typeof SYNC_STATUSES)[number];

export const AUDIT_ACTIONS = [
  'CREATED',
  'UPDATED',
  'READ',
  'EXPORTED',
  'DOWNLOADED',
  'SEALED',
  'CONVERTED_TO_FIR',
  'SYNC_REQUESTED',
  'AI_REQUESTED',
  'DELETED',
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const FILING_STATUSES = [
  'DRAFT',
  'CHECKLIST',
  'FILED',
  'DEFECT',
  'REFILED',
  'REGISTERED',
] as const;
export type FilingStatus = (typeof FILING_STATUSES)[number];

export const FILING_TYPES = [
  'PETITION',
  'APPLICATION',
  'REPLY',
  'AFFIDAVIT',
  'VAKALATNAMA',
  'WRITTEN_STATEMENT',
  'INTERIM_APPLICATION',
  'OTHER',
] as const;
export type FilingType = (typeof FILING_TYPES)[number];

export const KNOWLEDGE_CATEGORIES = [
  'TEMPLATE',
  'ACT',
  'RULE',
  'CIRCULAR',
  'NOTIFICATION',
  'SOP',
  'DRAFT',
] as const;
export type KnowledgeCategory = (typeof KNOWLEDGE_CATEGORIES)[number];

export const LEGAL_NOTIFICATION_TYPES = [
  'HEARING_SCHEDULED',
  'HEARING_REMINDER',
  'COMPLAINT_FOLLOW_UP_DUE',
  'COMPLAINT_ESCALATED',
  'FILING_DEFECT',
  'GENERAL',
] as const;
export type LegalNotificationType = (typeof LEGAL_NOTIFICATION_TYPES)[number];

/** Law firm staff titles */
export const FIRM_TITLES = [
  'MANAGING_PARTNER',
  'SENIOR_PARTNER',
  'PARTNER',
  'ASSOCIATE',
  'SENIOR_ASSOCIATE',
  'JUNIOR_ASSOCIATE',
  'LITIGATION_LAWYER',
  'CORPORATE_LAWYER',
  'INTERN',
  'LAW_CLERK',
  'LEGAL_RESEARCHER',
  'PARALEGAL',
  'RECOVERY',
  'DOCUMENTATION',
  'RECEPTION',
  'FINANCE',
  'HR',
  'EXTERNAL_COUNSEL',
] as const;
export type FirmTitle = (typeof FIRM_TITLES)[number];

export const FIRM_DEPARTMENTS = [
  'LITIGATION',
  'CORPORATE',
  'RECOVERY',
  'DOCUMENTATION',
  'RESEARCH',
  'FINANCE',
  'HR',
  'ADMIN',
  'GENERAL',
] as const;
export type FirmDepartment = (typeof FIRM_DEPARTMENTS)[number];

/** Enterprise access levels (module/field matrix) */
export const ACCESS_LEVELS = [
  'VIEW',
  'COMMENT',
  'EDIT',
  'APPROVE',
  'DELETE',
  'ASSIGN',
  'ARCHIVE',
  'EXPORT',
  'PRINT',
  'BILLING',
  'EVIDENCE',
  'RESEARCH',
  'ADMIN',
  'SUPER_ADMIN',
] as const;
export type AccessLevel = (typeof ACCESS_LEVELS)[number];

export const MATTER_TEAM_ROLES = [
  'LEAD_ADVOCATE',
  'CO_COUNSEL',
  'RESEARCH_LAWYER',
  'DRAFTING_LAWYER',
  'COURT_APPEARANCE_LAWYER',
  'CLERK',
  'PARALEGAL',
  'CLIENT_RELATIONSHIP_MANAGER',
  'RECOVERY_OFFICER',
  'DOCUMENT_CONTROLLER',
] as const;
export type MatterTeamRole = (typeof MATTER_TEAM_ROLES)[number];

export const WAR_ROOM_ENTRY_TYPES = [
  'DISCUSSION',
  'INTERNAL_NOTE',
  'PRIVATE_MESSAGE',
  'STRATEGY',
  'ARGUMENT',
  'COUNTER_ARGUMENT',
  'EVIDENCE_NOTE',
  'WITNESS_NOTE',
  'RESEARCH',
  'JUDGMENT_LINK',
  'LINK',
  'MEETING_NOTE',
  'VOICE_NOTE',
  'ACTION',
] as const;
export type WarRoomEntryType = (typeof WAR_ROOM_ENTRY_TYPES)[number];

export const CASE_VISIBILITY = ['RESTRICTED', 'BRANCH', 'FIRM'] as const;
export type CaseVisibility = (typeof CASE_VISIBILITY)[number];
