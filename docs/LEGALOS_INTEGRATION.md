# WOXOX CRM ↔ LegalOS integration

Sooraj’s CRM (`woxox-crm`) is the host UI. LegalOS lives as a nested module and connects via SSO.

## Layout

```
crm/                          ← this repo (https://github.com/SoorajCanbridge/crm)
  src/                        ← Next.js 14 CRM (NextAuth → Express :8000)
  modules/legalos/            ← junction → ../woxox-legalos (LegalOS monorepo)
  src/app/.../apps/legalos    ← CRM shell + iframe
  src/app/api/legalos/bridge  ← SSO bridge (CRM session → LegalOS JWT)
```

Local note: `modules/legalos` is a **directory junction** to `C:\Users\CanBridge\Projects\woxox-legalos` so both projects share one codebase and one `node_modules` (avoids disk duplication). On another machine, either clone LegalOS beside CRM and recreate the junction, or copy the module in.

## Ports

| Service | Port | Command |
| --- | --- | --- |
| WOXOX CRM UI | 3000 | `npm run dev` |
| LegalOS API | 4000 | `npm run legalos:api` |
| LegalOS UI | 3001 | `npm run legalos:web` |
| CRM backend (Sooraj) | 8000 | existing Express API |

## First-time setup

```bash
# from crm root
npm install
npm run legalos:install

# ensure LegalOS API env has bridge secret (modules/legalos/.env)
# CRM_BRIDGE_SECRET=woxox-crm-legalos-dev-bridge
# CORS_ORIGIN=http://localhost:3000,http://localhost:3001
# LEGALOS_USE_MEMORY_MONGO=true
```

## Run (3 terminals)

```bash
npm run legalos:api
npm run legalos:web
npm run dev
```

1. Sign in to CRM at http://localhost:3000  
2. Open sidebar **LegalOS → Practice OS** (`/en/apps/legalos`)  
3. CRM calls `/api/legalos/bridge` → LegalOS `POST /api/v1/auth/crm-bridge` → iframe SSO into LegalOS dashboard  

## Compatibility map

| Concern | How it connects |
| --- | --- |
| Auth | NextAuth session → bridge secret → LegalOS JWT |
| Clients / CRM data | Stay on CRM (`/manager/customer`, leads) — LegalOS Clients page remains host placeholder |
| Billing / invoices | Stay on CRM Finance menus |
| Tasks | Stay on CRM Documentation / tasks |
| Matters / FIR / evidence / court | LegalOS Mongo module |

## Production notes

- Rotate `CRM_BRIDGE_SECRET` (32+ chars) in both CRM `.env` and `modules/legalos/.env`
- Point `LEGALOS_API_URL` / `NEXT_PUBLIC_LEGALOS_WEB_URL` at deployed hosts
- Use real Mongo for LegalOS (`LEGALOS_USE_MEMORY_MONGO=false`)
- Optionally replace iframe with subdomain (`legal.woxox…`) sharing the same bridge

## Deep links (optional next step)

From a lead/customer page, link:

`/{lang}/apps/legalos?leadId=<mongoId>`  

and pass that into LegalOS case create as external CRM ref.
