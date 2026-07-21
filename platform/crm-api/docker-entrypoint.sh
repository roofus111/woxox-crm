#!/bin/sh
set -e

echo "Running Prisma schema sync..."
npx prisma db push --skip-generate

if [ "${SEED_DB:-false}" = "true" ]; then
  echo "Seeding database..."
  npx tsx prisma/seed.ts || true
fi

exec "$@"
