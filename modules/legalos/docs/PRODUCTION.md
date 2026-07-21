# LegalOS production runbook

## What “production complete” means here

LegalOS ships as a **deployable enterprise module** with:

- Persistent MongoDB (no memory Mongo in production)
- JWT auth (login/register in non-prod; self-register disabled in prod)
- Role-scoped permissions + case ACL / branch / firm visibility
- Rate limiting (global + stricter auth limiter), Helmet, readiness probes
- Error responses strip internal details in production
- Real S3 presigned uploads when credentials are set
- Optional OpenAI-backed AI assists
- Docker images for API + web
- Indexed case queries + React Query `staleTime` for UI speed

It still **reuses WOXOX** for CRM, billing, and task manager. Map host stubs in `apps/api/src/host/` when embedding into the full WOXOX platform (see `docs/HOST_INTEGRATION.md`).

Licensed eCourts / SCC / Manupatra stay disabled until credentials are provided.

## Quick start (local / Docker)

### Local (no Docker)

```bash
# API — memory Mongo for local only
LEGALOS_USE_MEMORY_MONGO=true npm run dev:api

# Web
npm run dev:web
```

Sign in at `http://localhost:3000/login` with `demo@woxox.local` / `demo123`.

### Docker Compose

1. Copy `.env.production.example` → `.env` and set secrets.
2. Launch:

```bash
docker compose up --build -d
```

3. Open the app, register is disabled in production — provision users via your IdP / admin seed, or mint a JWT for host embedding:

```bash
JWT_SECRET=your-32+-char-secret node scripts/mint-jwt.mjs
```

4. Check:

- API liveness: `GET http://localhost:4000/health`
- API readiness: `GET http://localhost:4000/ready`
- App: `http://localhost:3000/legal/dashboard`

## Security model (enterprise)

| Control | Behavior |
| --- | --- |
| Case visibility | `RESTRICTED` / `BRANCH` / `FIRM` + per-user ACL + matter team |
| List/analytics scoping | Complaints, FIRs, hearings, evidence, portfolio analytics filter to accessible cases |
| Auth | Production rejects self-register; auth endpoints rate-limited |
| CORS | Explicit origins only; localhost blocked unless `ALLOW_LOCALHOST_CORS=true` |
| Client tokens | Session from `/login` (zustand persist); no public bearer baked into production builds |
| Mocks | `NEXT_PUBLIC_ALLOW_MOCKS` ignored when `NODE_ENV=production` |

## JWT contract

HS256 token signed with `JWT_SECRET`.

| Claim | Required | Notes |
| --- | --- | --- |
| `sub` | yes | User id (Mongo ObjectId for LocalUser) |
| `workspaceIds` | yes in prod (`WORKSPACE_AUTH_MODE=claim`) | Array of workspace ObjectIds |
| `roles` or `permissions` | recommended | Roles map to LegalOS permissions |
| `iss` / `aud` | if configured | Must match `JWT_ISSUER` / `JWT_AUDIENCE` |

## Production env checklist

- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET` ≥ 32 chars
- [ ] `WORKSPACE_AUTH_MODE=claim`
- [ ] `LEGALOS_USE_MEMORY_MONGO=false`
- [ ] `MONGODB_URI` points at managed Mongo
- [ ] `CORS_ORIGIN` set to real web origin(s) (not `*`, not localhost)
- [ ] `LEGALOS_REQUIRE_S3=true` + S3 credentials (for evidence)
- [ ] Web: `NEXT_PUBLIC_ALLOW_MOCKS=false`
- [ ] Web: users authenticate via `/login` (or host SSO injects session later)

## Smoke checklist (pre-release)

- [ ] `npm run typecheck` passes
- [ ] `npm run build` passes
- [ ] Login → dashboard loads live data
- [ ] Cases list respects ACL (non-admin sees only accessible / firm / branch)
- [ ] Case detail 403 UI when access denied
- [ ] Complaints / FIRs / calendar / evidence load without mock leakage in prod
- [ ] `/health` and `/ready` return ok against real Mongo + S3 (if required)

## Host embedding (Phase 0)

Replace stubs under `apps/api/src/host/` with WOXOX platform services:

| Stub | Replace with |
| --- | --- |
| `auth.middleware.ts` | WOXOX JWT/session guard |
| `workspace.middleware.ts` | Tenancy membership |
| `permit.middleware.ts` | WOXOX RBAC registry |
| `object-storage.service.ts` | Platform S3 signer (already AWS-ready) |
| `notification.service.ts` / `outbox.service.ts` / `socket.emitter.ts` | Platform bus |

## What you still need outside this repo

| Item | Why |
| --- | --- |
| Docker Desktop (optional) | Full compose stack; without it use memory Mongo locally |
| S3 bucket + keys | Evidence upload/download in production (`LEGALOS_REQUIRE_S3=true`) |
| Licensed eCourts / SCC / Manupatra keys | Research/court sync HTTP calls |
| WOXOX host URL | Forward outbox/notifications to platform (`WOXOX_HOST_API_URL`) |
| OpenAI key | Model-backed AI drafts |

CRM, tasks, and billing remain in WOXOX host modules (placeholders in LegalOS UI).
