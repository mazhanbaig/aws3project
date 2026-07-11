#!/bin/bash -x
exec > /var/log/user-data.log 2>&1
set -euo pipefail

echo "[$(date)] Starting user-data bootstrap..."

# 2GB swapfile — prevent OOM on t3.micro
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

echo "[$(date)] Swapfile configured"

# Install Node.js 20 LTS
dnf install -y nodejs git npm 2>&1

echo "[$(date)] Node.js $(node -v) installed"

# Skip Puppeteer Chromium download for faster npm ci
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install PM2
npm install -g pm2 2>&1

echo "[$(date)] PM2 installed"

# Clone repo
rm -rf /app
git clone --depth 1 ${app_repo_url} /app 2>&1
cd /app/app

echo "[$(date)] App cloned"

# Write env file
cat > .env.production << EOF
DB_HOST=${db_host}
DB_PORT=${db_port}
DB_NAME=${db_name}
DB_USER=${db_user}
DB_PASSWORD=${db_password}
JWT_SECRET=${jwt_secret}
S3_BUCKET_NAME=${s3_bucket}
AWS_REGION=${aws_region}
PORT=3001
EOF

echo "[$(date)] Env file created"

# Install and build
npm ci --prefer-offline 2>&1
npm run build 2>&1

echo "[$(date)] Build completed"

# Copy to standalone
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/ 2>/dev/null || true
cp .env.production .next/standalone/

# Start app
set -a; source .env.production; set +a
pm2 start .next/standalone/server.js --name "competitor-tracker" --update-env 2>&1
pm2 save 2>&1

echo "[$(date)] Bootstrap complete — app running on port 3001"
