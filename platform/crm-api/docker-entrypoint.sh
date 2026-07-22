#!/bin/sh
set -e

echo "Running Prisma schema sync..."
npx prisma db push --skip-generate --accept-data-loss

if [ "${SEED_DB:-false}" = "true" ]; then
  echo "Seeding database..."
  npx tsx prisma/seed.ts || echo "Seed skipped/failed (continuing)"
fi

echo "Starting CRM API..."
exec "$@"
