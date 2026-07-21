/** Lifecycle status of a legal matter / court case. */
export enum CaseStatus {
  Draft = 'DRAFT',
  Active = 'ACTIVE',
  Pending = 'PENDING',
  Adjourned = 'ADJOURNED',
  UnderTrial = 'UNDER_TRIAL',
  ReservedForOrder = 'RESERVED_FOR_ORDER',
  Disposed = 'DISPOSED',
  Closed = 'CLOSED',
  OnHold = 'ON_HOLD',
  Archived = 'ARCHIVED',
}

/** Primary practice area or procedural bucket for Indian legal matters. */
export enum PracticeArea {
  Civil = 'CIVIL',
  Criminal = 'CRIMINAL',
  Family = 'FAMILY',
  Property = 'PROPERTY',
  Consumer = 'CONSUMER',
  Labour = 'LABOUR',
  Company = 'COMPANY',
  Arbitration = 'ARBITRATION',
  Tax = 'TAX',
  NCLT = 'NCLT',
  DRT = 'DRT',
  NI_ACT = 'NI_ACT',
  MotorAccident = 'MOTOR_ACCIDENT',
  CyberCrime = 'CYBER_CRIME',
  IPR = 'IPR',
  Constitutional = 'CONSTITUTIONAL',
  Writ = 'WRIT',
  Appeal = 'APPEAL',
  Revision = 'REVISION',
  TransferPetition = 'TRANSFER_PETITION',
  SLP = 'SLP',
  Bail = 'BAIL',
  AnticipatoryBail = 'ANTICIPATORY_BAIL',
}

/** Classification of parties involved in legal proceedings. */
export enum PartyType {
  CorporateClient = 'CORPORATE_CLIENT',
  IndividualClient = 'INDIVIDUAL_CLIENT',
  GovernmentClient = 'GOVERNMENT_CLIENT',
  FamilyMember = 'FAMILY_MEMBER',
  OppositeParty = 'OPPOSITE_PARTY',
  Witness = 'WITNESS',
  PoliceOfficer = 'POLICE_OFFICER',
  Advocate = 'ADVOCATE',
  CourtStaff = 'COURT_STAFF',
}

/** Status of a complaint registered in the Complaint Register. */
export enum ComplaintStatus {
  Registered = 'REGISTERED',
  Acknowledged = 'ACKNOWLEDGED',
  UnderReview = 'UNDER_REVIEW',
  UnderInvestigation = 'UNDER_INVESTIGATION',
  Escalated = 'ESCALATED',
  PendingFollowUp = 'PENDING_FOLLOW_UP',
  ConvertedToFir = 'CONVERTED_TO_FIR',
  Closed = 'CLOSED',
  Dismissed = 'DISMISSED',
}

/** High-level category for complaint classification. */
export enum ComplaintCategory {
  Civil = 'CIVIL',
  Criminal = 'CRIMINAL',
  Consumer = 'CONSUMER',
  Police = 'POLICE',
  Corruption = 'CORRUPTION',
  DomesticViolence = 'DOMESTIC_VIOLENCE',
  ChequeDishonour = 'CHEQUE_DISHONOUR',
  Property = 'PROPERTY',
  Labour = 'LABOUR',
  Cyber = 'CYBER',
  Environmental = 'ENVIRONMENTAL',
  Service = 'SERVICE',
  Other = 'OTHER',
}

/** Status of a First Information Report (FIR). */
export enum FirStatus {
  Registered = 'REGISTERED',
  UnderInvestigation = 'UNDER_INVESTIGATION',
  ChargesheetFiled = 'CHARGESHEET_FILED',
  Closed = 'CLOSED',
  Quashed = 'QUASHED',
  Transferred = 'TRANSFERRED',
  Pending = 'PENDING',
}

/** Bail application or grant status linked to an FIR or criminal matter. */
export enum BailStatus {
  NotApplicable = 'NOT_APPLICABLE',
  Applied = 'APPLIED',
  Granted = 'GRANTED',
  Rejected = 'REJECTED',
  Cancelled = 'CANCELLED',
  Expired = 'EXPIRED',
  PendingHearing = 'PENDING_HEARING',
}

/** Scheduled court hearing lifecycle status. */
export enum HearingStatus {
  Scheduled = 'SCHEDULED',
  Adjourned = 'ADJOURNED',
  PartHeard = 'PART_HEARD',
  Completed = 'COMPLETED',
  Cancelled = 'CANCELLED',
  ReservedForOrder = 'RESERVED_FOR_ORDER',
}

/** Evidence artifact processing and custody status. */
export enum EvidenceStatus {
  PendingUpload = 'PENDING_UPLOAD',
  Uploaded = 'UPLOADED',
  Processing = 'PROCESSING',
  Available = 'AVAILABLE',
  Sealed = 'SEALED',
  Quarantined = 'QUARANTINED',
  Rejected = 'REJECTED',
}

/** Media classification for evidence artifacts. */
export enum EvidenceMediaType {
  Document = 'DOCUMENT',
  Image = 'IMAGE',
  Audio = 'AUDIO',
  Video = 'VIDEO',
  Scan = 'SCAN',
  Other = 'OTHER',
}

/** Audited AI task types supported by LegalOS. */
export enum AiTask {
  JudgmentSummary = 'JUDGMENT_SUMMARY',
  BareActExplanation = 'BARE_ACT_EXPLANATION',
  PetitionDraft = 'PETITION_DRAFT',
  HearingPrep = 'HEARING_PREP',
  RiskAnalysis = 'RISK_ANALYSIS',
  Timeline = 'TIMELINE',
}

/** Licensed external data provider identifiers. */
export enum ProviderId {
  Ecourts = 'ecourts',
  SccOnline = 'scc-online',
  Manupatra = 'manupatra',
}

/** Provider synchronization job status. */
export enum SyncStatus {
  Pending = 'PENDING',
  InProgress = 'IN_PROGRESS',
  Completed = 'COMPLETED',
  Failed = 'FAILED',
  Cancelled = 'CANCELLED',
  NotConfigured = 'NOT_CONFIGURED',
}

/** Delivery channel for legal notifications and reminders. */
export enum NotificationChannel {
  InApp = 'IN_APP',
  Email = 'EMAIL',
  Sms = 'SMS',
  Push = 'PUSH',
  Socket = 'SOCKET',
}
