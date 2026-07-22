# WOXOX Super Admin — Company Control Center

Hidden ops portal for WOXOX staff to manage company tenants, billing, and platform security.

## URLs

| Path | Purpose |
|------|---------|
| `/en/super-admin` | Staff login (MFA challenge when enabled) |
| `/en/super-admin/companies` | Searchable company list + KPIs |
| `/en/super-admin/companies/create` | Create tenant |
| `/en/super-admin/companies/[id]` | Company profile, actions, audit |
| `/en/super-admin/billing` | Plans, subscriptions, coupons, MRR |
| `/en/super-admin/staff` | Platform staff RBAC |
| `/en/super-admin/security` | Staff MFA (TOTP) setup |
| `/en/get-started` | Customer self-serve pricing + Razorpay checkout |
| `/en/onboarding` | Post-signup onboarding wizard |

Production: `https://app.woxox.com/en/super-admin`

## Login

Platform user with a staff role (`SUPER_ADMIN` or `PLATFORM_*`).

After seed (`SEED_PLATFORM_DB=true`):

- Email: `admin@woxox.local`
- Password: `admin123`

Then set `SEED_PLATFORM_DB=false`. Enable MFA from **Security**.

## Features

- Global search (name, tenant code, slug, admin email)
- Filters: status, plan, module
- Server-side pagination
- KPI strip: total / active / trial / expired / suspended
- Bulk suspend / activate
- Company profile: subscription, usage, health score, modules, CS note
- Extend trial, reset password, change owner
- Soft delete / restore
- Platform audit timeline
- Secure platform impersonation (15 minutes, audited)
- **Open in CRM** — one-time 5-minute handoff into the live Mongo CRM as company admin
- Welcome email on tenant create / paid self-serve signup (SMTP)
- Staff MFA (TOTP) + login challenge
- Customer self-serve checkout via Razorpay

## API (Bearer SUPER_ADMIN / staff JWT)

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
| POST | `/api/v1/super-admin/tenants/:id/legacy-open` |
| POST | `/api/v1/super-admin/impersonation/stop` |

Auth / MFA / onboarding:

| Method | Path |
|--------|------|
| POST | `/api/v1/auth/login` — may return `{ mfaRequired, mfaToken }` |
| POST | `/api/v1/auth/mfa/verify` |
| POST | `/api/v1/auth/mfa/setup` |
| POST | `/api/v1/auth/mfa/enable` |
| POST | `/api/v1/auth/mfa/disable` |
| GET | `/api/v1/auth/onboarding` |
| POST | `/api/v1/auth/onboarding` |
| POST | `/api/v1/auth/onboarding/complete` |

Public billing (no auth):

| Method | Path |
|--------|------|
| GET | `/api/v1/billing/public/plans` |
| POST | `/api/v1/billing/public/signup` |
| POST | `/api/v1/billing/public/verify` |

All mutating super-admin actions write `PlatformAuditLog`.

## Required env

```bash
SUPER_ADMIN_PROVISION_SECRET=your-long-random-secret
APP_ORIGIN=https://app.woxox.com
LEGACY_API_URL=http://crmserver:8000
```

Optional billing + mail:

```bash
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM="WOXOX <noreply@woxox.com>"
```

Razorpay webhook URL: `https://platform.woxox.com/api/v1/billing/webhooks/razorpay`

### Marketing website (www)

Self-serve checkout lives on the marketing site and calls the same public billing APIs:

- `GET /billing/public/plans`
- `POST /billing/public/signup`
- `POST /billing/public/verify`
- `POST /billing/public/contact` — creates a lead in `MARKETING_WORKSPACE_ID`

Set `CORS_ORIGIN` to include `https://www.woxox.com` (and apex if used).

Razorpay webhook events: `payment.captured`, `order.paid`, `payment_link.paid`, `payment.failed`.

## Deploy (EC2)

```bash
cd /opt/woxox/crm && git pull
# Ensure SMTP_* and RAZORPAY_* are set in .env.production
sudo docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build crm-api crm-web
sudo docker compose -f docker-compose.prod.yml --env-file .env.production exec crm-api npx prisma db push
```

### Smoke tests

1. Open `https://app.woxox.com/en/super-admin` → sign in
2. **Security** → set up authenticator → log out → login requires 6-digit code
3. List companies; search; open profile; extend trial
4. Impersonate → red banner → Stop; **Open in CRM**
5. **Billing** → MRR; assign plan
6. **Staff** → manage Finance / Support / Sales (Owner only)
7. `/en/get-started` → trial or paid Razorpay checkout → welcome email (if SMTP set)
8. `/en/onboarding` → complete 3-step wizard

## Staff RBAC

| Role | Access |
|------|--------|
| Platform Owner (`SUPER_ADMIN`) | Full |
| Finance | Billing read/write, tenants read |
| Customer Support | Tenants write + impersonate, billing read |
| Sales | Tenants write, billing read |
| DevOps | Tenants read + impersonate |
| Read Only | Tenants + billing + audit read |

Permissions are enforced on API routes via `@RequirePermissions`. MFA is available to all platform staff.

## Billing foundation

- Plans catalog (trial / starter / professional / enterprise)
- Subscriptions per workspace
- Coupons, invoice ledger, MRR/ARR KPIs
- Stripe webhook (optional) + Razorpay orders / payment links / verify / webhook
- Self-serve signup activates workspace on payment (checkout verify or webhook) and sends welcome email

## Out of scope (later)

Taxes, EKS, backups/export, feature flags.
