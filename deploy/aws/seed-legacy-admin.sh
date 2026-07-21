#!/usr/bin/env bash
# Seed legacy crmserver admin user in production MongoDB.
# Usage: bash deploy/aws/seed-legacy-admin.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "${ROOT}"

ENV_FILE="${ENV_FILE:-.env.production}"
COMPOSE="docker compose -f docker-compose.prod.yml --env-file ${ENV_FILE}"

if [ ! -f "${ENV_FILE}" ]; then
  echo "Missing ${ENV_FILE}. Copy from .env.production.example and configure."
  exit 1
fi

echo "==> Copying seed script into crmserver container..."
${COMPOSE} cp deploy/aws/seed-legacy-admin.js crmserver:/app/scripts/seed-legacy-admin.js

echo "==> Seeding legacy admin user..."
${COMPOSE} exec -T crmserver node scripts/seed-legacy-admin.js

echo ""
echo "Platform API admin is seeded automatically when SEED_PLATFORM_DB=true."
echo "Use the same credentials for both: admin@woxox.local / admin123"
