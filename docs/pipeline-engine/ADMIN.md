# Pipeline Builder — Administrator Guide (Phase 1)

## Open the builder

CRM sidebar → **Pipelines** (`/{lang}/manager/pipeline`)

Requires a platform session. If you only have a legacy CRM token, the builder bridges it automatically on load.

## Create a pipeline

1. **New Pipeline** or **Templates**
2. Prefer a system template: Sales, Immigration / Work Permit, Recruitment, Customer Support
3. Set **Module** (crm, immigration, …) so the engine can be reused across products

## Configure stages

- Drag to reorder
- Inspector tabs: Basic, Business, Fields, Documents, Checklist, Permissions, Automations, Transitions, Audit
- Automations are **definitions only** in Phase 1 (no live sends yet)

## Publish

**Publish** creates an immutable version and syncs stage names/order to legacy Mongo so Campaigns and the existing workflow board keep working.

Pass/store the company admin email so the bridge can find the Mongo company (`legacyCompanyEmail`).

## Clone / import / export

- **Clone** — duplicate within the workspace
- **Export** — download JSON (`woxox-pipeline-v1`)
- **Import** — upload that JSON
- **Save Template** — store workspace-owned template for reuse

## Transition rules

If a stage has **no** transition rules, any move is allowed (still subject to fields/docs/checklist/permissions).

If rules exist, only listed target stages are allowed.
