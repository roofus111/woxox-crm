# WOXOX LegalOS for India

Native Legal Practice Management module for the WOXOX CRM & ERP platform.

Advocates should never need to leave WOXOX — matters, complaints, FIRs, hearings, evidence, research, AI drafting, billing signals, and court sync all live inside one workspace.

## Stack (per build specification)

| Layer | Technology |
| --- | --- |
| Web | Next.js (App Router), TypeScript, Tailwind, React Query, Zustand |
| API | Express, Mongoose, JWT, Zod |
| Data | MongoDB (workspace-scoped collections) |
| Realtime | Socket.io event names (host emitter stub) |
| Files | Presigned private object storage (WOXOX S3 abstraction) |
| Providers | Official/licensed adapters only — **no scraping** |

> The product brief in chat mentioned NestJS. The attached **Cursor Build Specification** defines Express + Mongo as the host-aligned stack. This repo follows the PDF.

## Monorepo layout

```text
woxox-legalos/
├── apps/
│   ├── api/                 # Express LegalOS router (/api/v1/legal)
│   └── web/                 # Next.js LegalOS routes (/legal/*)
├── packages/
│   └── shared/              # DTOs, enums, permissions, provider contracts
├── docs/
│   ├── ARCHITECTURE.md
│   ├── ER_DIAGRAM.md
│   └── API.md
├── .env.example
└── package.json
```

## Quick start

```bash
cp .env.example .env
cp apps/web/.env.local.example apps/web/.env.local
npm install

# Option A — embedded Mongo (default in .env.example)
# LEGALOS_USE_MEMORY_MONGO=true

# Option B — persistent Mongo only
docker compose up -d mongo
# then set LEGALOS_USE_MEMORY_MONGO=false in .env

npm run dev:api
npm run dev:web
```

- Web: http://localhost:3000/legal/dashboard  
- API: http://localhost:4000/api/v1/legal  
- Ready: http://localhost:4000/ready  

Development auth: send `Authorization: Bearer demo` and `X-Workspace-Id: 000000000000000000000001` (or `demo`).

When `LEGALOS_USE_MEMORY_MONGO=true`, the API boots an embedded MongoDB and seeds a small demo case/complaint/hearing set.

## Production

See **[docs/PRODUCTION.md](docs/PRODUCTION.md)** for the full runbook.

```bash
cp .env.production.example .env
# set JWT_SECRET (>=32 chars), S3, CORS, web token…
JWT_SECRET=… node scripts/mint-jwt.mjs
docker compose up --build -d
```

Production requires claim-based workspace JWT membership, persistent Mongo, and disables demo auth / mock UI data.

## Module map

| Area | Route | Permission |
| --- | --- | --- |
| Dashboard | `/legal/dashboard` | `legal.dashboard.read` |
| Matters | `/legal/cases` | `legal.case.*` |
| Complaint Register | `/legal/complaints` | `legal.complaint.*` |
| FIR | `/legal/firs` | `legal.fir.*` |
| Evidence | `/legal/evidence` | `legal.evidence.*` |
| Research | `/legal/research` | `legal.research.use` |
| Providers admin | `/legal/admin/providers` | `legal.integration.manage` |

## Non-negotiables

1. **Workspace isolation** — every document carries `workspaceId`.
2. **No unauthorized scraping** — eCourts / SCC Online / Manupatra adapters stay disabled until licensed credentials exist.
3. **Complaint ≠ FIR** — conversion creates a linked FIR and retains complaint lineage.
4. **Evidence custody** — SHA-256, append-only custody events, immutable original object key.
5. **AI is assistive** — audited, citation-aware, attorney review required before filing/send.

## Host integration (Phase 0)

Before merging into production WOXOX, map these stubs to host services:

- JWT/session guard & workspace resolver  
- RBAC `permit()` middleware  
- Activity / audit / notification / outbox / Socket.io  
- S3 upload signer & document service  
- Design system primitives & command palette  

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## Phased delivery

0. Align placeholders to WOXOX conventions  
1. Foundation — cases, parties, hearings, evidence, dashboard  
2. Complaint Register + FIR conversion  
3. Licensed provider adapters + sync jobs  
4. AI & analytics read models  
5. Hardening, observability, pilot  

## License

UNLICENSED — proprietary WOXOX module.
