# WOXOX CRM Platform — Implementation Roadmap

## Current state vs target

| Layer | Today (`crm` + `crmserver`) | Target (this spec) |
|-------|----------------------------|---------------------|
| Frontend | Next.js 14, MUI, JS | Next.js 15, TS, Tailwind, ShadCN |
| Backend | Express + Mongoose | NestJS + Prisma + PostgreSQL |
| Tenancy | `companyId` on Mongo docs | `workspaceId` row isolation |
| Deploy | Local dev | AWS EKS, RDS, ElastiCache, S3 |

**Strategy:** Strangler pattern — new `platform/crm-api` (NestJS) runs alongside existing Express API. Frontend migrates module-by-module.

---

## Phase 1 — Foundation ✅ (started)

- [x] PostgreSQL schema (Workspace, User, Lead, Contact, Company, Deal, Pipeline, Activity, Task, AuditLog)
- [x] NestJS API skeleton (`platform/crm-api`)
- [x] JWT auth + workspace tenancy
- [x] Leads REST API + Swagger
- [x] Docker Compose (Postgres + Redis)
- [x] Seed script (`admin@woxox.local` / `admin123`)

## Phase 2 — Core CRM ✅ (backend)

- [x] Contacts API (`GET/POST/PATCH/DELETE /contacts`)
- [x] Companies API (`/companies`)
- [x] Pipelines API + kanban board (`/pipelines`, `/pipelines/:id/board`)
- [x] Deals API + stage move (`/deals`, `PUT /deals/:id/stage`)
- [x] Activities API (`/activities`)
- [x] Dashboard KPIs (`GET /dashboard/summary`)
- [x] Expanded seed (companies, contacts, deals, pipeline, activities, tasks)
- [x] Next.js CRM dashboard wired via feature flag (`NEXT_PUBLIC_USE_CRM_PLATFORM_DASHBOARD`)

**Next:** Contacts/Deals UI pages + kanban board on new API.

## Phase 1 — Foundation (run locally)
```bash
npm run platform:up
npm run crm-api:install
cp platform/crm-api/.env.example platform/crm-api/.env
npm run crm-api:migrate
npm run crm-api:seed
npm run crm-api:dev
# API → http://localhost:4001/api/v1
# Swagger → http://localhost:4001/api/docs
```

---

## Phase 2 — Core CRM ✅ (API) / Frontend next

- [x] Contacts, Companies, Deals, Pipelines APIs + kanban board
- [x] Activities timeline API
- [x] Dashboard KPIs (`GET /dashboard/summary`)
- [ ] Next.js UI wired to new API (feature flag)

---

## Phase 3 — Communication & automation (6–8 weeks)

- Unified inbox (email, WhatsApp — port from `crmserver/modules`)
- Workflow builder (triggers, conditions, actions)
- Sales automation (routing, SLAs, escalations)
- Marketing campaigns (port email module to Postgres events)

---

## Phase 4 — AI layer (ongoing)

- Lead scoring, next-best-action, email/WhatsApp drafts
- Meeting/call summaries, churn & opportunity prediction
- OpenSearch for global + AI search

---

## Phase 5 — Enterprise (8–12 weeks)

- RBAC fine-grained permissions, 2FA, audit logs, IP allowlists
- Custom objects/fields, report builder, scheduled exports
- Mobile PWA + offline cache
- AWS: EKS, RDS, Terraform, CI/CD, CloudWatch dashboards

---

## Module mapping (legacy → new)

| Legacy (`crmserver`) | New API module |
|---------------------|----------------|
| `Lead.js` | `leads` ✅ |
| `Customer.js` | `contacts` |
| `pipeline.js` | `pipelines` + `deals` |
| `sales.js` / `invoice.js` | `deals` + `billing` |
| `followUp.js` | `activities` |
| `Task.js` | `tasks` |
| `Company.js` | `workspaces` + `companies` |

---

## Next immediate step

Wire CRM dashboard to new Leads API behind feature flag, then migrate Contacts and Deals.
