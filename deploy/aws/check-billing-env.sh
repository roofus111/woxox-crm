#!/bin/bash
set -euo pipefail
cd /opt/woxox/crm

echo "=== env lines ==="
grep -nE '^(RAZORPAY_|MARKETING_|CORS_|WEBSITE_|sudo )' .env.production || true

echo "=== workspaces ==="
sudo docker compose -f docker-compose.prod.yml --env-file .env.production exec -T postgres \
  psql -U woxox -d woxox_crm -c 'SELECT id, name, slug, status, plan FROM "Workspace" WHERE "deletedAt" IS NULL ORDER BY "createdAt" ASC LIMIT 20;'

echo "=== website container ==="
sudo docker compose -f docker-compose.prod.yml --env-file .env.production ps website nginx crm-api
