# WOXOX Super Admin (Control Center)

Hidden ops portal to create and manage company tenants.

## URL

- Local: `http://localhost:3000/en/super-admin`
- Production: `https://app.woxox.com/en/super-admin`

## Login

Use a platform user with role `SUPER_ADMIN`.

After seed / redeploy with `SEED_PLATFORM_DB=true`:

- Email: `admin@woxox.local`
- Password: `admin123`

## What it does

1. **Create tenant** — workspace + admin user + default pipeline + modules + trial dates
2. **Also provisions legacy Mongo company/user** (so `app.woxox.com` login works) when secrets are set
3. **List tenants** — code, plan, status, modules, admins
4. **Suspend / Activate**
5. **Reset admin password**

## Required env (production)

In `.env.production`:

```bash
SUPER_ADMIN_PROVISION_SECRET=your-long-random-secret
```

Compose passes this to both `crm-api` and `crmserver`.

## API (Bearer SUPER_ADMIN JWT)

| Method | Path |
|--------|------|
| GET | `/api/v1/super-admin/tenants` |
| POST | `/api/v1/super-admin/tenants` |
| PATCH | `/api/v1/super-admin/tenants/:id` |
| POST | `/api/v1/super-admin/tenants/:id/reset-password` |

## Deploy notes

1. `git pull` on EC2
2. Rebuild `crm-api`, `crmserver`, `crm-web`
3. Ensure seed runs once (`SEED_PLATFORM_DB=true`) so admin becomes SUPER_ADMIN
4. Then set `SEED_PLATFORM_DB=false`
