# LegalOS Entity-Relationship Diagram

## Mermaid ER

```mermaid
erDiagram
  WORKSPACE ||--o{ PARTY : owns
  WORKSPACE ||--o{ LEGAL_CASE : owns
  WORKSPACE ||--o{ LEGAL_COMPLAINT : owns
  WORKSPACE ||--o{ LEGAL_FIR : owns
  WORKSPACE ||--o{ LEGAL_HEARING : owns
  WORKSPACE ||--o{ LEGAL_EVIDENCE : owns
  WORKSPACE ||--o{ LEGAL_DOCUMENT : owns
  WORKSPACE ||--o{ PROVIDER_SYNC : owns
  WORKSPACE ||--o{ AUDIT_EVENT : owns
  WORKSPACE ||--o{ AI_REQUEST : owns

  PARTY }o--o{ LEGAL_CASE : "client / opposite / witness"
  USER }o--o{ LEGAL_CASE : advocates

  LEGAL_CASE ||--o{ LEGAL_HEARING : schedules
  LEGAL_CASE ||--o{ LEGAL_EVIDENCE : has
  LEGAL_CASE ||--o{ LEGAL_DOCUMENT : has
  LEGAL_CASE ||--o{ ORDER_JUDGMENT : has
  LEGAL_CASE }o--o{ LEGAL_COMPLAINT : links
  LEGAL_CASE }o--o{ LEGAL_FIR : links

  LEGAL_COMPLAINT ||--o| LEGAL_FIR : "converts_to (1:1 lineage)"
  LEGAL_COMPLAINT ||--o{ WITNESS_REF : lists
  LEGAL_COMPLAINT ||--o{ POLICE_FOLLOWUP : tracks
  LEGAL_COMPLAINT ||--o{ ESCALATION : raises

  LEGAL_FIR ||--o{ CHARGE_SHEET : may_have
  LEGAL_FIR }o--o| LEGAL_COMPLAINT : sourceComplaintId

  LEGAL_EVIDENCE ||--o{ CUSTODY_EVENT : append_only
  LEGAL_EVIDENCE ||--o{ EVIDENCE_VERSION : versions
  LEGAL_DOCUMENT ||--o{ DOC_VERSION : lineage

  LEGAL_CASE ||--o{ PROVIDER_SYNC : external_refs
  LEGAL_CASE ||--o{ RESEARCH_WORKSPACE : research
```

## Collections & indexes

| Collection | Core relationships | High-value indexes |
| --- | --- | --- |
| `legal_cases` | clientPartyIds[], oppositePartyIds[], advocateIds[], complaintIds[], firIds[] | `{workspaceId,status,nextHearingAt}`; `{workspaceId,court.cino}`; text(caseNumber,title,partiesSearch) |
| `legal_complaints` | clientPartyId, oppositePartyIds[], policeStationId?, convertedFirId?, linkedCaseId? | unique sparse `{workspaceId,complaintNumber}`; `{workspaceId,status,nextFollowUpAt}` |
| `legal_firs` | clientPartyId, officerPartyId?, linkedCaseId?, sourceComplaintId? | unique sparse `{workspaceId,firNumber,policeStationKey}`; `{workspaceId,bailStatus}` |
| `legal_evidence` | caseId?, complaintId?, firId?, storageKey, custodyEvents[] | `{workspaceId,sha256}`; `{workspaceId,caseId,occurredAt}` |
| `legal_hearings` | caseId, assignedAdvocateIds[], court snapshot | `{workspaceId,scheduledAt,status}`; `{workspaceId,caseId,scheduledAt}` |
| `legal_documents` | caseId?, evidenceId?, template/version lineage | `{workspaceId,caseId,type,createdAt}`; `{workspaceId,checksum}` |
| `legal_provider_syncs` | provider, entityType, entityId, externalKey, status | unique `{workspaceId,provider,entityType,externalKey}`; `{nextRunAt,status}` |
| `legal_audit_events` | entityType, entityId, actorId, correlationId | `{workspaceId,entityType,entityId,occurredAt}` |

## Standard audit fields

All mutable models include: `workspaceId`, `createdBy`, `updatedBy`, `createdAt`, `updatedAt`, `deletedAt`, `version` (optimistic concurrency).

## Complaint → FIR rule

Conversion **never overwrites** the complaint. It creates a FIR with `sourceComplaintId`, sets `complaint.convertedFirId`, appends an audit event `CONVERTED_TO_FIR`, and rejects duplicate conversion with `COMPLAINT_ALREADY_CONVERTED`.
