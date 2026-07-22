#!/usr/bin/env bash
# Bootstrap a fresh Ubuntu 22.04/24.04 EC2 instance for WOXOX CRM.
# Run as root or with sudo: bash deploy/aws/bootstrap-ec2.sh

set -euo pipefail

APP_DIR="${APP_DIR:-/opt/woxox}"
CRM_REPO="${CRM_REPO:-https://github.com/SoorajCanbridge/crm.git}"
CRMSERVER_REPO="${CRMSERVER_REPO:-https://github.com/SoorajCanbridge/crmserver.git}"
WEBSITE_REPO="${WEBSITE_REPO:-https://github.com/SoorajCanbridge/woxox-website.git}"
CRM_BRANCH="${CRM_BRANCH:-main}"

echo "==> Installing Docker..."
apt-get update -y
apt-get install -y ca-certificates curl git ufw
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

echo "==> Cloning repositories into ${APP_DIR}..."
mkdir -p "${APP_DIR}"
cd "${APP_DIR}"

if [ ! -d crm/.git ]; then
  git clone --branch "${CRM_BRANCH}" "${CRM_REPO}" crm
fi

if [ ! -d crmserver/.git ]; then
  git clone "${CRMSERVER_REPO}" crmserver
fi

if [ ! -d woxox-website/.git ]; then
  git clone "${WEBSITE_REPO}" woxox-website
fi

cp "${APP_DIR}/crm/deploy/docker/crmserver.Dockerfile" "${APP_DIR}/crmserver/Dockerfile"

cd "${APP_DIR}/crm"

if [ ! -f .env.production ]; then
  cp .env.production.example .env.production
  echo ""
  echo "!! Edit ${APP_DIR}/crm/.env.production with your domain + secrets before starting."
fi

mkdir -p deploy/aws/certs

echo "==> Firewall (UFW)..."
ufw allow OpenSSH || true
ufw allow 80/tcp || true
ufw allow 443/tcp || true
ufw --force enable || true

echo ""
echo "Bootstrap complete."
echo "Next steps:"
echo "  1. Point DNS: www.*, app.*, api.*, platform.* → this server's public IP"
echo "  2. Edit ${APP_DIR}/crm/.env.production (CORS_ORIGIN must include www)"
echo "  3. Update deploy/aws/nginx/woxox.conf server_name values"
echo "  4. Place TLS certs in ${APP_DIR}/crm/deploy/aws/certs/ (fullchain.pem, privkey.pem)"
echo "  5. Run: cd ${APP_DIR}/crm && bash deploy/aws/deploy.sh"
