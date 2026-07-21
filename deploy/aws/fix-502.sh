#!/usr/bin/env bash
# Rebuild crm-web and restart nginx when the site shows 502.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "${ROOT}"

ENV_FILE="${ENV_FILE:-.env.production}"
COMPOSE="docker compose -f docker-compose.prod.yml --env-file ${ENV_FILE}"

echo "==> Pulling latest code..."
git pull --ff-only || true

export NGINX_CONF="${ROOT}/deploy/aws/nginx/woxox-http-only.conf"

echo "==> Rebuilding crm-web (no cache)..."
${COMPOSE} build --no-cache crm-web

echo "==> Starting stack..."
${COMPOSE} up -d

echo "==> Waiting for crm-web..."
sleep 45

echo "==> Container status:"
${COMPOSE} ps

echo "==> crm-web logs:"
${COMPOSE} logs crm-web --tail 30

echo "==> HTTP test:"
curl -I http://localhost || true

echo ""
echo "Open: http://$(curl -s http://checkip.amazonaws.com | tr -d '\n')/en/login"
