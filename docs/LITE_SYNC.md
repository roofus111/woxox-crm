# Lite branch sync

Pulled full UI from `origin/lite` into the local `main` working tree (343+ files).

## Kept / re-applied after sync

- LegalOS module junction: `modules/legalos`
- LegalOS shell: `/en/apps/legalos` + `/api/legalos/bridge`
- Sidebar **LegalOS → Practice OS**
- Login post-auth redirect to `/dashboards/crm`
- Local `.env` pointing at `localhost:8000` / LegalOS `:4000`/`:3001`

## Backend (crmserver)

No `lite` branch exists. Current `main` is **newer** than `production` (336 commits ahead), so local `crmserver` was kept as-is with memory-mongo `npm run dev`.

## Run

```powershell
# terminals
cd C:\Users\CanBridge\Projects\crmserver; npm run dev
cd C:\Users\CanBridge\Projects\crm; npm run legalos:api
cd C:\Users\CanBridge\Projects\crm; npm run legalos:web
cd C:\Users\CanBridge\Projects\crm; npm run dev
```

Login: `admin@woxox.local` / `admin123`
