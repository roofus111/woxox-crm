# LegalOS Architecture

## Product boundary

LegalOS is a **workspace-scoped WOXOX module**. It does not own identity, tenancy, notification primitives, binary storage, or visual tokens. It owns:

- Legal domain data (cases, complaints, FIRs, hearings, evidence, research workspaces)
- Legal workflows (complaint→FIR conversion, custody sealing, provider sync)
- Provider synchronization state
- Legal-specific presentation under `/legal/*`

```text
[Next.js LegalOS routes + shared WOXOX shell]
    → React Query clients / Zustand ephemeral UI
    → Express LegalOS router (auth + workspace + RBAC)
        → Domain services: case | complaint | FIR | hearing | evidence
        → Providers: eCourts | SCC Online | Manupatra (licensed adapters)
        → AI orchestration: policy gate → retrieval → model → audit
        → Host services: notifications, activities, S3, Socket.io
        → MongoDB + outbox/queue
    → Workers: sync, reminders, document processing, analytics
```

## Provider abstraction

UI never consumes raw provider payloads. Adapters implement:

- `CourtDataProvider` (`ecourts`)
- `LegalResearchProvider` (`scc-online` | `manupatra`)

If credentials/scopes are missing, capabilities return `not_configured` / `unsupported`. Manual import remains available. Scraping, browser automation, and reverse-engineering are forbidden.

## Security model

1. Authenticate via host JWT/session  
2. Resolve workspace  
3. Check granular `legal.*` permission  
4. Apply case assignment / ethical-wall policy where configured  
5. Soft-delete by default; legal hold blocks destructive actions  

Evidence ingest: register intent → private upload → hash/scan worker → custody event → notify.

## Realtime events

Payload shape: `{ workspaceId, entityId, eventId, occurredAt, actor? }`

- `legal:hearing.reminder`
- `legal:case.updated`
- `legal:provider.sync.completed`
- `legal:order.available`
- `legal:complaint.followup_due`
- `legal:evidence.processed`

Clients refetch authorized React Query keys on event.

## Configuration

See root `.env.example`. Provider secrets must live in the WOXOX secret manager — never in browser bundles.
