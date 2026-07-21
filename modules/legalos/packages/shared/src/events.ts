/** Socket.io and outbox event name constants for the LegalOS domain. */
export const LEGAL_EVENT_NAMES = {
  HearingReminder: 'legal:hearing.reminder',
  CaseUpdated: 'legal:case.updated',
  CaseCreated: 'legal.case.created',
  ProviderSyncCompleted: 'legal:provider.sync.completed',
  OrderAvailable: 'legal:order.available',
  ComplaintFollowUpDue: 'legal:complaint.followup_due',
  EvidenceProcessed: 'legal:evidence.processed',
  ComplaintConvertedToFir: 'legal:complaint.converted_to_fir',
  EvidenceSealed: 'legal:evidence.sealed',
  AiRequestCompleted: 'legal:ai.request.completed',
} as const;

export type LegalEventName =
  (typeof LEGAL_EVENT_NAMES)[keyof typeof LEGAL_EVENT_NAMES];

/** Base payload shared by all real-time legal domain events. */
export interface LegalEventBasePayload {
  workspaceId: string;
  entityId: string;
  eventId: string;
  occurredAt: string;
  actor?: string;
  correlationId?: string;
}

/** Reminder fired for an upcoming hearing. */
export interface LegalHearingReminderPayload extends LegalEventBasePayload {
  caseId: string;
  hearingId: string;
  scheduledAt: string;
  reminderOffsetMinutes: number;
}

/** Case record updated; clients should refetch authorized case queries. */
export interface LegalCaseUpdatedPayload extends LegalEventBasePayload {
  caseId: string;
  changedFields?: string[];
}

/** New case created in the workspace. */
export interface LegalCaseCreatedPayload extends LegalEventBasePayload {
  caseId: string;
}

/** Provider synchronization completed for an entity. */
export interface LegalProviderSyncCompletedPayload extends LegalEventBasePayload {
  provider: string;
  entityType: string;
  externalKey?: string;
  syncStatus: string;
}

/** New court order available for a linked case. */
export interface LegalOrderAvailablePayload extends LegalEventBasePayload {
  caseId: string;
  orderId: string;
  orderDate?: string;
}

/** Complaint follow-up due notification. */
export interface LegalComplaintFollowUpDuePayload extends LegalEventBasePayload {
  complaintId: string;
  nextFollowUpAt: string;
}

/** Evidence processing pipeline completed. */
export interface LegalEvidenceProcessedPayload extends LegalEventBasePayload {
  evidenceId: string;
  status: string;
  parentType: 'case' | 'complaint' | 'fir';
  parentId: string;
}

/** Complaint successfully converted to a linked FIR. */
export interface LegalComplaintConvertedToFirPayload extends LegalEventBasePayload {
  complaintId: string;
  firId: string;
}

/** Evidence sealed under chain-of-custody policy. */
export interface LegalEvidenceSealedPayload extends LegalEventBasePayload {
  evidenceId: string;
  sealedBy: string;
}

/** AI request completed with audit metadata. */
export interface LegalAiRequestCompletedPayload extends LegalEventBasePayload {
  requestId: string;
  task: string;
  reviewRequired: boolean;
}

/** Discriminated map of event names to payload shapes. */
export interface LegalEventPayloadMap {
  [LEGAL_EVENT_NAMES.HearingReminder]: LegalHearingReminderPayload;
  [LEGAL_EVENT_NAMES.CaseUpdated]: LegalCaseUpdatedPayload;
  [LEGAL_EVENT_NAMES.CaseCreated]: LegalCaseCreatedPayload;
  [LEGAL_EVENT_NAMES.ProviderSyncCompleted]: LegalProviderSyncCompletedPayload;
  [LEGAL_EVENT_NAMES.OrderAvailable]: LegalOrderAvailablePayload;
  [LEGAL_EVENT_NAMES.ComplaintFollowUpDue]: LegalComplaintFollowUpDuePayload;
  [LEGAL_EVENT_NAMES.EvidenceProcessed]: LegalEvidenceProcessedPayload;
  [LEGAL_EVENT_NAMES.ComplaintConvertedToFir]: LegalComplaintConvertedToFirPayload;
  [LEGAL_EVENT_NAMES.EvidenceSealed]: LegalEvidenceSealedPayload;
  [LEGAL_EVENT_NAMES.AiRequestCompleted]: LegalAiRequestCompletedPayload;
}

/** Typed legal domain event wrapper for Socket.io emission. */
export type LegalDomainEvent<T extends LegalEventName = LegalEventName> = {
  name: T;
  payload: LegalEventPayloadMap[T];
};

/** Outbox record shape for durable event publishing. */
export interface LegalOutboxEvent<T extends LegalEventName = LegalEventName> {
  id: string;
  name: T;
  payload: LegalEventPayloadMap[T];
  publishedAt?: string;
  createdAt: string;
}
