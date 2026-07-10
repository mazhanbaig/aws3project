#!/bin/bash
set -euo pipefail

exec > >(tee -a /var/log/user-data.log) 2>&1

echo "[$(date)] Starting user-data bootstrap..."

# 2GB swapfile — prevent OOM during npm install/build on t3.micro
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

echo "[$(date)] Swapfile configured"

# Install Node.js 20 LTS from NodeSource (Amazon Linux 2023 compatible)
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs git

echo "[$(date)] Node.js $(node -v) installed"

npm install -g pm2

echo "[$(date)] PM2 installed"

git clone ${app_repo_url} /app
cd /app

echo "[$(date)] App cloned"

npm ci --prefer-offline
npm run build

echo "[$(date)] Build completed"

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

echo "[$(date)] Environment file created"

# Start with the standalone Next.js server
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/ 2>/dev/null || true
cp .env.production .next/standalone/

pm2 start .next/standalone/server.js --name "competitor-tracker" --update-env
pm2 startup
pm2 save

echo "[$(date)] PM2 started"
echo "[$(date)] Bootstrap complete"