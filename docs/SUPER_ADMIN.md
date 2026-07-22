# WOXOX Super Admin — Company Control Center

Hidden ops portal for WOXOX staff to manage company tenants.

## URLs

| Path | Purpose |
|------|---------|
| `/en/super-admin` | Login |
| `/en/super-admin/companies` | Searchable company list + KPIs |
| `/en/super-admin/companies/create` | Create tenant |
| `/en/super-admin/companies/[id]` | Company profile, actions, audit |

Production: `https://app.woxox.com/en/super-admin`

## Login

Platform user with role `SUPER_ADMIN`.

After seed (`SEED_PLATFORM_DB=true`):

- Email: `admin@woxox.local`
- Password: `admin123`

Then set `SEED_PLATFORM_DB=false`.

## Features (Phase A)

- Global search (name, tenant code, slug, admin email)
- Filters: status, plan, module
- Server-side pagination
- KPI strip: total / active / trial / expired / suspended
- Bulk suspend / activate
- Company profile: subscription, usage, health score, modules, CS note
- Extend trial, reset password, change owner
- Soft delete / restore
- Platform audit timeline
- Secure platform impersonation (15 minutes, audited) — JWT for Nest platform APIs; legacy Mongo handoff is a later slice

## API (Bearer SUPER_ADMIN JWT)

| Method | Path |
|--------|------|
| GET | `/api/v1/super-admin/stats` |
| GET | `/api/v1/super-admin/tenants?q=&status=&plan=&module=&page=&pageSize=` |
| GET | `/api/v1/super-admin/tenants/:id` |
| POST | `/api/v1/super-admin/tenants` |
| PATCH | `/api/v1/super-admin/tenants/:id` |
| POST | `/api/v1/super-admin/tenants/bulk` |
| POST | `/api/v1/super-admin/tenants/:id/extend-trial` |
| POST | `/api/v1/super-admin/tenants/:id/change-owner` |
| POST | `/api/v1/super-admin/tenants/:id/soft-delete` |
| POST | `/api/v1/super-admin/tenants/:id/restore` |
| POST | `/api/v1/super-admin/tenants/:id/reset-password` |
| GET | `/api/v1/super-admin/tenants/:id/audit` |
| POST | `/api/v1/super-admin/tenants/:id/impersonate` |
| POST | `/api/v1/super-admin/impersonation/stop` |

All mutating actions write `PlatformAuditLog`.

## Required env

```bash
SUPER_ADMIN_PROVISION_SECRET=your-long-random-secret
APP_ORIGIN=https://app.woxox.com
LEGACY_API_URL=http://crmserver:8000
```

## Deploy (EC2)

```bash
cd /opt/woxox/crm && git pull
sudo docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build crm-api crm-web
# Apply schema once inside crm-api if needed:
sudo docker compose -f docker-compose.prod.yml --env-file .env.production exec crm-api npx prisma db push
```

### Smoke tests

1. Open `https://app.woxox.com/en/super-admin` → sign in
2. List loads with stats; search by company name
3. Open a company → extend trial, toggle module, save note
4. Impersonate → red banner appears → Stop impersonation
5. Soft delete → filter Deleted → Restore

## Out of scope (later)

Billing/Stripe, staff RBAC/MFA, EKS, legacy Mongo browser impersonation, backups/export.
