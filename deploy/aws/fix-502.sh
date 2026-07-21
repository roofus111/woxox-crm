#!/usr/bin/env bash
# Rebuild crm-web and restart nginx when the site shows 502.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "${ROOT}"

ENV_FILE="${ENV_FILE:-.env.production}"
COMPOSE="docker compose -f docker-compose.prod.yml --env-file ${ENV_FILE}"

echo "==> System resources BEFORE cleanup"
free -h || true
df -h / || true
sudo docker system df || true

echo "==> Ensuring 2GB swap (helps Next.js build on t3.medium)"
if ! swapon --show | grep -q '/swapfile'; then
  sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile || true
fi
free -h || true

echo "==> Freeing Docker disk space (old images/cache)"
sudo docker builder prune -af || true
sudo docker image prune -af || true

echo "==> Pulling latest code..."
git pull --ff-only || true

export NGINX_CONF="${ROOT}/deploy/aws/nginx/woxox-http-only.conf"

echo "==> Stopping crm-web/nginx during rebuild to free RAM"
${COMPOSE} stop crm-web nginx || true

echo "==> Rebuilding crm-web (no cache)..."
${COMPOSE} build --no-cache crm-web

echo "==> Starting stack..."
${COMPOSE} up -d

echo "==> Waiting for crm-web..."
sleep 45

echo "==> Container status:"
${COMPOSE} ps

echo "==> crm-web logs:"
${COMPOSE} logs crm-web --tail 40

echo "==> HTTP test:"
curl -I http://localhost || true

echo ""
echo "Open: http://$(curl -s http://checkip.amazonaws.com | tr -d '\n')/en/login"
