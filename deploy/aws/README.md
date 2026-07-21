# WOXOX CRM — AWS deployment (EC2 + Docker)

Fastest path to host the full CRM stack on AWS.

## Architecture

| Service | Container | Port (internal) | Public URL |
|---------|-----------|-----------------|------------|
| CRM UI (Next.js) | `crm-web` | 3000 | `https://app.yourdomain.com` |
| Legacy API (crmserver) | `crmserver` | 8000 | `https://api.yourdomain.com` |
| Platform API (NestJS) | `crm-api` | 4001 | `https://platform.yourdomain.com` |
| MongoDB | `mongo` | 27017 | internal only |
| PostgreSQL | `postgres` | 5432 | internal only |
| Redis | `redis` | 6379 | internal only |
| Nginx | `nginx` | 80/443 | public entry |

## Prerequisites

1. **AWS account** with EC2 access
2. **Domain** (Route 53 or any DNS) — 3 subdomains recommended
3. **EC2 instance**: Ubuntu 22.04+, `t3.medium` minimum (2 vCPU / 4 GB RAM)
4. **Security group**: inbound `22`, `80`, `443`

## Step 1 — Launch EC2

1. AWS Console → EC2 → Launch instance
2. AMI: **Ubuntu Server 22.04 LTS**
3. Type: **t3.medium** (or larger for production)
4. Key pair: create/download `.pem`
5. Security group: allow SSH (22), HTTP (80), HTTPS (443)
6. Storage: 40 GB+ gp3

## Step 2 — Bootstrap the server

SSH in:

```bash
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>
```

Clone CRM (or upload deploy files) and run bootstrap:

```bash
sudo apt-get update && sudo apt-get install -y git
git clone https://github.com/SoorajCanbridge/crm.git
cd crm
sudo bash deploy/aws/bootstrap-ec2.sh
```

This installs Docker, clones `crm` + `crmserver` into `/opt/woxox/`.

## Step 3 — Configure DNS

Point these A records to your EC2 public IP:

- `app.yourdomain.com`
- `api.yourdomain.com`
- `platform.yourdomain.com`

## Step 4 — Configure environment

```bash
cd /opt/woxox/crm
cp .env.production.example .env.production
nano .env.production
```

Set:

- `APP_ORIGIN`, `API_ORIGIN`, `PLATFORM_API_ORIGIN` — your real HTTPS URLs
- `NEXTAUTH_SECRET`, `JWT_SECRET`, `POSTGRES_PASSWORD` — strong random values
- `CRMSERVER_PATH=../crmserver`

Update nginx hostnames:

```bash
nano deploy/aws/nginx/woxox.conf
# Replace app.yourdomain.com, api.yourdomain.com, platform.yourdomain.com
```

## Step 5 — TLS certificates

### Option A — Let's Encrypt (recommended on EC2)

```bash
sudo apt-get install -y certbot
sudo certbot certonly --standalone -d app.yourdomain.com -d api.yourdomain.com -d platform.yourdomain.com
sudo cp /etc/letsencrypt/live/app.yourdomain.com/fullchain.pem deploy/aws/certs/
sudo cp /etc/letsencrypt/live/app.yourdomain.com/privkey.pem deploy/aws/certs/
```

### Option B — AWS ACM + ALB (later)

For production at scale, put an **Application Load Balancer** in front of EC2 with ACM certificates. Terminate TLS at ALB and use HTTP-only nginx internally.

## Step 6 — Deploy

```bash
cd /opt/woxox/crm
bash deploy/aws/deploy.sh
```

Open `https://app.yourdomain.com/en/login`.

## Update / redeploy

```bash
cd /opt/woxox/crm
git pull
bash deploy/aws/deploy.sh
```

## HTTP-only testing (no TLS yet)

Use this for the first deploy before DNS + Let's Encrypt are ready.

1. Copy the HTTP nginx config:

```bash
cd /opt/woxox/crm
cp deploy/aws/nginx/woxox-http-only.conf deploy/aws/nginx/woxox.conf
```

2. Set origins in `.env.production` to your Elastic IP (all on port 80):

```bash
APP_ORIGIN=http://<EC2_IP>
API_ORIGIN=http://<EC2_IP>/legacy-api
PLATFORM_API_ORIGIN=http://<EC2_IP>/platform-api
```

3. Generate secrets:

```bash
openssl rand -base64 32   # NEXTAUTH_SECRET
openssl rand -base64 32   # JWT_SECRET
```

4. Deploy and open `http://<EC2_IP>/en/login`

> **Note:** After `bootstrap-ec2.sh`, work from `/opt/woxox/crm` (bootstrap clones repos there). A one-off `git clone` in `$HOME` is only needed to fetch the bootstrap script before it is on GitHub.

## First admin login (required for legacy auth)

Login uses the **legacy crmserver** (`/legacy-api/api/login`). Fresh Mongo has no users — seed one after deploy:

```bash
cd /opt/woxox/crm
bash deploy/aws/seed-legacy-admin.sh
```

Default credentials:

- Email: `admin@woxox.local`
- Password: `admin123`

The **platform API** (Postgres) seeds automatically when `SEED_PLATFORM_DB=true` in `.env.production` — same email/password.

Set `SEED_PLATFORM_DB=false` after the first successful deploy.

## AWS CLI (optional, for automation)

Install AWS CLI on your machine to manage EC2/Route53 from terminal:

```powershell
# Windows (winget)
winget install Amazon.AWSCLI
aws configure
```

## Next steps (production hardening)

- [ ] Move MongoDB to **MongoDB Atlas** (update `MONGODB_URI` in compose)
- [ ] Move Postgres to **RDS** and Redis to **ElastiCache**
- [ ] Use **ECS Fargate** + **ECR** instead of single EC2
- [ ] Add **Terraform** for IaC (see `docs/CRM_PLATFORM_ROADMAP.md`)
- [ ] Enable **CloudWatch** logs: `docker compose logs -f`
- [ ] Set `SEED_PLATFORM_DB=false` after first deploy

## Troubleshooting

```bash
# Logs
docker compose -f docker-compose.prod.yml logs -f crm-web
docker compose -f docker-compose.prod.yml logs -f crmserver
docker compose -f docker-compose.prod.yml logs -f crm-api

# Restart one service
docker compose -f docker-compose.prod.yml restart crm-web

# Shell into container
docker compose -f docker-compose.prod.yml exec crm-web sh
```
