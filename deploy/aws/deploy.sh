#!/usr/bin/env bash
# Deploy / update WOXOX CRM on the current server FROM GIT.
# This is the durable path — never rely on docker cp hotfixes.
# Usage: bash deploy/aws/deploy.sh
#
# After AWS reconnect / instance reboot / compose recreate, run this script
# so UI + crmserver + crm-api match the committed main branches.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "${ROOT}"

ENV_FILE="${ENV_FILE:-.env.production}"
CRM_BRANCH="${CRM_BRANCH:-main}"
CRMSERVER_BRANCH="${CRMSERVER_BRANCH:-main}"
WEBSITE_BRANCH="${WEBSITE_BRANCH:-main}"

if [ ! -f "${ENV_FILE}" ]; then
  echo "Missing ${ENV_FILE}. Copy from .env.production.example and configure."
  exit 1
fi

if [ ! -f deploy/aws/certs/fullchain.pem ] || [ ! -f deploy/aws/certs/privkey.pem ]; then
  echo "WARNING: TLS certs not found in deploy/aws/certs/"
  echo "Using deploy/aws/nginx/woxox-http-only.conf (HTTP-only mode)."
  export NGINX_CONF="${ROOT}/deploy/aws/nginx/woxox-http-only.conf"
fi

echo "==> Syncing CRM (${CRM_BRANCH}) from origin..."
git fetch origin
git checkout "${CRM_BRANCH}"
git reset --hard "origin/${CRM_BRANCH}"

if [ -d ../crmserver/.git ]; then
  echo "==> Syncing crmserver (${CRMSERVER_BRANCH}) from origin..."
  (
    cd ../crmserver
    git fetch origin
    git checkout "${CRMSERVER_BRANCH}"
    git reset --hard "origin/${CRMSERVER_BRANCH}"
  )
fi

if [ -d ../woxox-website/.git ]; then
  echo "==> Syncing woxox-website (${WEBSITE_BRANCH}) from origin..."
  (
    cd ../woxox-website
    git fetch origin
    git checkout "${WEBSITE_BRANCH}"
    git reset --hard "origin/${WEBSITE_BRANCH}"
  ) || true
fi

echo "==> Building images from synced source (no docker cp)..."
docker compose -f docker-compose.prod.yml --env-file "${ENV_FILE}" build crmserver crm-api crm-web
docker compose -f docker-compose.prod.yml --env-file "${ENV_FILE}" up -d

echo "==> Service status:"
docker compose -f docker-compose.prod.yml --env-file "${ENV_FILE}" ps

echo ""
echo "Deploy complete — stack matches git ${CRM_BRANCH} / crmserver ${CRMSERVER_BRANCH}."
echo "  Website:       check WEBSITE_ORIGIN / www in nginx"
echo "  CRM UI:        check APP_ORIGIN in ${ENV_FILE}"
echo "  Legacy API:    check API_ORIGIN"
echo "  Platform API:  check PLATFORM_API_ORIGIN"
echo ""
echo "Do NOT docker cp into containers. Fix code in git, then re-run this script."