# WOXOX Pipeline Engine — Architecture (Phase 1)

## Principle

One configurable **Pipeline Engine** on NestJS + PostgreSQL. Modules (CRM, Immigration, Recruitment, …) consume the same APIs; behavior is driven by configuration (templates, stages, fields, documents, checklists, permissions, transition rules, automation definitions).

## Source of truth

- **PostgreSQL** via `platform/crm-api` Prisma models: `Pipeline`, `PipelineStage`, `StageField`, `StageDocument`, `StageChecklistItem`, `StageTransitionRule`, `StagePermission`, `StageAutomation`, `PipelineTemplate`, `StageTemplate`, `PipelineVersion`, `PipelineRecord`, `PipelineAuditLog`.
- **Mongo bridge** on publish: `POST /api/super-admin/sync-pipeline` (crmserver) so legacy Campaign + `/manager/workflow/:id` boards keep working until Phase 5 cutover.

## Key APIs (`/api/v1/pipelines`)

| Method | Path | Purpose |
|--------|------|---------|
| GET/POST | `/` | List / create |
| GET/PATCH/DELETE | `/:id` | Detail / update / archive |
| POST | `/:id/stages`, PUT `.../reorder` | Stage CRUD + DnD order |
| POST | `/:id/stages/:sid/fields\|documents\|checklist\|permissions\|automations` | Stage config |
| POST | `/:id/transitions` | Explicit transition edges |
| POST | `/:id/validate-transition` | Server-side gate |
| POST | `/:id/clone\|publish\|save-template` | Lifecycle |
| GET | `/:id/export`, POST `/import` | Portable JSON |
| GET | `/templates`, POST `/templates/apply` | System + workspace templates |

## Frontend

- Route: `/{lang}/manager/pipeline` — MUI Pipeline Builder (library, DnD stages, inspector tabs).
- Client: `src/libs/crmPlatformApi.js` pipeline helpers (JWT via platform bridge).

## Admin quick start

1. Ensure platform JWT (legacy token auto-bridged on builder load).
2. Open **Pipelines** → create from Sales / Immigration / Recruitment / Support template.
3. Configure stage fields, documents, checklist, permissions, automation defs.
4. **Publish** to snapshot a version and sync stages to Mongo (pass company email when needed).
5. Create Campaigns against the legacy Mongo pipeline id (`legacyMongoId` on the platform pipeline).

## Phase boundaries

- **P1 (this):** Builder + config + validation API + publish/bridge.
- **P2:** Premium Kanban on `PipelineRecord`.
- **P3:** Analytics / AI.
- **P4:** Execute automation definitions.
- **P5:** All modules on engine; retire Mongo pipeline CRUD.
