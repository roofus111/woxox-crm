#!/usr/bin/env bash
# Hard-sync EC2 /opt/woxox to origin/main and rebuild images.
# Preserves .env.production and TLS certs. Never uses docker cp.

set -euo pipefail

CRM_DIR=/opt/woxox/crm
SERVER_DIR=/opt/woxox/crmserver
ENV_FILE="${CRM_DIR}/.env.production"

echo "==> Backing up env..."
cp -a "${ENV_FILE}" /tmp/env.production.bak

echo "==> Syncing CRM to origin/main..."
cd "${CRM_DIR}"
chown -R ubuntu:ubuntu "${CRM_DIR}/.git" 2>/dev/null || true
git fetch origin
git checkout main
git reset --hard origin/main
git clean -fd -e .env.production -e .env -e 'deploy/aws/certs' -e node_modules

if [ ! -f "${ENV_FILE}" ]; then
  cp -a /tmp/env.production.bak "${ENV_FILE}"
fi

echo "==> Syncing crmserver to origin/main..."
cd "${SERVER_DIR}"
chown -R ubuntu:ubuntu "${SERVER_DIR}/.git" 2>/dev/null || true
git fetch origin
git checkout main
git reset --hard origin/main
git clean -fd -e .env -e node_modules -e uploads -e data -e 'data/wa-sessions'

# Baileys / personal WhatsApp module must be readable by container user
if [ -d modules/personalWhatsapp ]; then
  chmod -R a+rX modules/personalWhatsapp || true
fi

echo "CRM=$(cd "${CRM_DIR}" && git rev-parse --short HEAD)"
echo "CRMSERVER=$(cd "${SERVER_DIR}" && git rev-parse --short HEAD)"

cd "${CRM_DIR}"
echo "==> Building images from git source..."
docker compose -f docker-compose.prod.yml --env-file .env.production build crmserver crm-api crm-web

echo "==> Starting stack..."
docker compose -f docker-compose.prod.yml --env-file .env.production up -d

sleep 12
echo "==> Status:"
docker compose -f docker-compose.prod.yml --env-file .env.production ps

echo "==> Verify baked-in fixes:"
docker exec woxox-crm-prod-crmserver-1 grep -c isTeamMember /app/controllers/InsightsController.js
docker exec woxox-crm-prod-crmserver-1 grep -c 'await OAuthService.getAuthUrls' /app/modules/email/controllers/emailController.js
docker exec woxox-crm-prod-crmserver-1 printenv | grep -E 'API_BASE_URL|FRONTEND_URL' || true

echo "Done. Stack matches git main."
