#!/usr/bin/env bash
# Deploy / update WOXOX CRM on the current server.
# Usage: bash deploy/aws/deploy.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "${ROOT}"

ENV_FILE="${ENV_FILE:-.env.production}"

if [ ! -f "${ENV_FILE}" ]; then
  echo "Missing ${ENV_FILE}. Copy from .env.production.example and configure."
  exit 1
fi

if [ ! -f deploy/aws/certs/fullchain.pem ] || [ ! -f deploy/aws/certs/privkey.pem ]; then
  echo "WARNING: TLS certs not found in deploy/aws/certs/"
  echo "For initial HTTP-only testing, use deploy/aws/nginx/woxox-http-only.conf instead."
fi

echo "==> Pulling latest code..."
git pull --ff-only || true
if [ -d ../crmserver/.git ]; then
  (cd ../crmserver && git pull --ff-only) || true
fi

echo "==> Building and starting stack..."
docker compose -f docker-compose.prod.yml --env-file "${ENV_FILE}" up -d --build

echo "==> Service status:"
docker compose -f docker-compose.prod.yml --env-file "${ENV_FILE}" ps

echo ""
echo "Deploy complete."
echo "  CRM UI:        check APP_ORIGIN in ${ENV_FILE}"
echo "  Legacy API:    check API_ORIGIN"
echo "  Platform API:  check PLATFORM_API_ORIGIN"
