# WOXOX LegalOS — Phase 0 host mapping checklist

Before merging into production WOXOX, replace every stub in `apps/api/src/host/` with the platform equivalent.

| LegalOS stub | WOXOX equivalent to map | Standalone production status |
| --- | --- | --- |
| `auth.middleware.ts` | JWT/session guard | HS256 JWT with issuer/audience + role→permission mapping |
| `workspace.middleware.ts` | Workspace / tenancy resolver | `WORKSPACE_AUTH_MODE=claim` enforces `workspaceIds` |
| `permit.middleware.ts` | RBAC decorator / permission registry | JWT permissions / role defaults |
| `activity.service.ts` | Activity / timeline API | In-process log (swap for host bus) |
| `notification.service.ts` | Notification templates + channels | Legal notification collection + host stub |
| `object-storage.service.ts` | S3 upload signer | Real AWS S3 presign when credentials set |
| `outbox.service.ts` | Outbox / event bus | In-memory (swap for host bus) |
| `socket.emitter.ts` | Socket.io namespaces | Stub emitter |

Also confirm:

- Design system primitives (Button, DataTable, Dialog, Form, Tabs, Badge, EmptyState)
- Command palette / keyboard shortcut facility
- API response envelope conventions
- Docker / observability standards — see `docs/PRODUCTION.md`
- Provider licensing & legal policy for eCourts / SCC Online / Manupatra

See `docs/ARCHITECTURE.md`, `docs/PRODUCTION.md`, and the Cursor Build Specification (19 July 2026).
