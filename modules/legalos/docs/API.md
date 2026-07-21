# LegalOS REST API

Base path: `/api/v1/legal`  
Envelope: `{ "success": true, "data": ..., "meta"?: { page, limit, total } }`  
Errors: `{ "success": false, "error": { "code": string, "message": string, "details"?: unknown } }`

All list endpoints support `page`, `limit` (capped), `q`, `sort`, `direction`, plus domain filters. Stable tie-breaker sort is applied.

## Authentication & tenancy

| Header | Purpose |
| --- | --- |
| `Authorization: Bearer <jwt>` | Host identity (dev: `Bearer demo`) |
| `X-Workspace-Id` | Active workspace ObjectId |
| `X-Correlation-Id` | Optional request correlation |

## Permissions

| Key | Used by |
| --- | --- |
| `legal.dashboard.read` | Portfolio analytics |
| `legal.case.read\|create\|update\|archive\|export` | Matters |
| `legal.complaint.read\|create\|update\|convert_to_fir` | Complaint Register |
| `legal.fir.read\|create\|update` | FIR workbench |
| `legal.evidence.read\|upload\|download\|seal` | Evidence custody |
| `legal.research.use` | Licensed research |
| `legal.ai.use` | AI assistant |
| `legal.analytics.read` | Reports |
| `legal.integration.manage` | Provider admin |
| `legal.admin.manage` | Module admin |

## Endpoints

### Cases

| Method | Path | Permission | Purpose |
| --- | --- | --- | --- |
| GET | `/cases` | `legal.case.read` | Filtered case list |
| POST | `/cases` | `legal.case.create` | Create matter |
| GET | `/cases/:id` | `legal.case.read` | Case workbench |
| PATCH | `/cases/:id` | `legal.case.update` | Update matter |
| POST | `/cases/:id/hearings` | `legal.case.update` | Schedule hearing + reminders |

### Complaints (unique WOXOX feature)

| Method | Path | Permission | Purpose |
| --- | --- | --- | --- |
| GET | `/complaints` | `legal.complaint.read` | List / filter / age analytics filters |
| POST | `/complaints` | `legal.complaint.create` | Register complaint |
| GET | `/complaints/:id` | `legal.complaint.read` | Detail + timeline |
| PATCH | `/complaints/:id` | `legal.complaint.update` | Update / escalate / follow-up |
| POST | `/complaints/:id/convert-to-fir` | `legal.complaint.convert_to_fir` | One-click linked FIR |

### FIRs

| Method | Path | Permission | Purpose |
| --- | --- | --- | --- |
| GET | `/firs` | `legal.fir.read` | List FIRs |
| POST | `/firs` | `legal.fir.create` | Register FIR |
| GET | `/firs/:id` | `legal.fir.read` | FIR detail |
| PATCH | `/firs/:id` | `legal.fir.update` | Update investigation / bail / charge sheet |

### Evidence

| Method | Path | Permission | Purpose |
| --- | --- | --- | --- |
| POST | `/evidence/upload-intents` | `legal.evidence.upload` | Register metadata + presigned upload |
| GET | `/evidence` | `legal.evidence.read` | List by case/complaint/FIR |
| POST | `/evidence/:id/seal` | `legal.evidence.seal` | Seal custody state |
| GET | `/evidence/:id/download` | `legal.evidence.download` | Authorized download URL |

### Parties (Client Management)

| Method | Path | Permission | Purpose |
| --- | --- | --- | --- |
| GET | `/parties` | `legal.case.read` | List parties by type |
| POST | `/parties` | `legal.case.create` | Create party |
| PATCH | `/parties/:id` | `legal.case.update` | Update party / relationships |

### Providers

| Method | Path | Permission | Purpose |
| --- | --- | --- | --- |
| GET | `/providers/capabilities` | `legal.integration.manage` or `legal.case.read` | Feature/config status |
| POST | `/providers/:provider/sync` | `legal.integration.manage` | Queue authorized sync |

`provider` ∈ `ecourts` | `scc-online` | `manupatra`

### AI

| Method | Path | Permission | Purpose |
| --- | --- | --- | --- |
| POST | `/ai/requests` | `legal.ai.use` | Start audited AI task |
| GET | `/ai/requests/:id` | `legal.ai.use` | Fetch result + citations + audit meta |

### Analytics

| Method | Path | Permission | Purpose |
| --- | --- | --- | --- |
| GET | `/analytics/portfolio` | `legal.analytics.read` or `legal.dashboard.read` | Dashboard aggregates |

## Socket events

Clients subscribe via host Socket.io namespace. On event, refetch React Query keys for the entity.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for event names.
