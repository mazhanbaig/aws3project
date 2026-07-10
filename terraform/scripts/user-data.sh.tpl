#!/bin/bash
set -euo pipefail

exec > >(tee -a /var/log/user-data.log) 2>&1

echo "[$(date)] Starting user-data bootstrap..."

# 2GB swapfile — prevent OOM on t3.micro
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

echo "[$(date)] Swapfile configured"

# Install Node.js 20 LTS (AL2023 uses dnf, not yum)
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs git

echo "[$(date)] Node.js $(node -v) installed"

# Chromium for Puppeteer (AL2023)
dnf install -y chromium 2>/dev/null || echo "[WARN] Chromium unavailable, Puppeteer will use bundled"
echo 'export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true' >> /etc/profile.d/puppeteer.sh

npm install -g pm2

echo "[$(date)] PM2 installed"

git clone ${app_repo_url} /app
cd /app/app

echo "[$(date)] App cloned"

# Write env file BEFORE build so it exists even if build fails
cat > .env.production << EOF
DB_HOST=${db_host}
DB_PORT=${db_port}
DB_NAME=${db_name}
DB_USER=${db_user}
DB_PASSWORD=${db_password}
JWT_SECRET=${jwt_secret}
S3_BUCKET_NAME=${s3_bucket}
AWS_REGION=${aws_region}
EOF

echo "[$(date)] Env file created"

npm ci --prefer-offline
npm run build

echo "[$(date)] Build completed"

cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/ 2>/dev/null || true
cp .env.production .next/standalone/

set -a; source .env.production; set +a

pm2 start .next/standalone/server.js --name "competitor-tracker" --update-env
pm2 startup systemd -u root --hp /root
pm2 save

echo "[$(date)] Bootstrap complete — app running on port 3000"
