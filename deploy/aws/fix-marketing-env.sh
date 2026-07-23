#!/bin/bash
set -euo pipefail
cd /opt/woxox/crm

# Remove accidental shell commands saved into env file
sed -i '/^sudo /d' .env.production

# Remove placeholder Razorpay / marketing lines so we can rewrite cleanly
sed -i -E '/^RAZORPAY_KEY_ID=rzp_live_your_key_id$/d' .env.production
sed -i -E '/^RAZORPAY_KEY_SECRET=your_key_secret$/d' .env.production
sed -i -E '/^RAZORPAY_WEBHOOK_SECRET=your_webhook_secret$/d' .env.production
sed -i -E '/^MARKETING_WORKSPACE_ID=your_sales_workspace_id$/d' .env.production

WS_ID="cmrv0sxlv0000qf259u32oupy"
if ! grep -q '^MARKETING_WORKSPACE_ID=' .env.production; then
  echo "MARKETING_WORKSPACE_ID=${WS_ID}" >> .env.production
else
  sed -i "s|^MARKETING_WORKSPACE_ID=.*|MARKETING_WORKSPACE_ID=${WS_ID}|" .env.production
fi

if ! grep -q '^MARKETING_NOTIFY_EMAIL=' .env.production; then
  echo "MARKETING_NOTIFY_EMAIL=sales@woxox.com" >> .env.production
fi

if ! grep -q '^WEBSITE_PATH=' .env.production; then
  echo "WEBSITE_PATH=../woxox-website" >> .env.production
fi

echo "=== relevant env ==="
grep -nE '^(RAZORPAY_|MARKETING_|CORS_|WEBSITE_|APP_ORIGIN|PLATFORM_API)' .env.production | sed -E 's/(SECRET|PASS|KEY)=.+/\1=***/'

echo "=== ensure website + nginx up ==="
sudo docker compose -f docker-compose.prod.yml --env-file .env.production up -d website nginx crm-api
sudo docker compose -f docker-compose.prod.yml --env-file .env.production ps website nginx crm-api
