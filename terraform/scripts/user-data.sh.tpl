#!/bin/bash -x
logger -t user-data "=== Starting user-data bootstrap ==="

# --- 2GB swapfile (prevents OOM on t3.micro) ---
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
logger -t user-data "Swapfile configured"

# --- Install Node.js + git ---
dnf install -y nodejs git npm
logger -t user-data "Node.js $(node -v) installed"

# --- Install PM2 ---
npm install -g pm2
logger -t user-data "PM2 installed"

# --- Clone repo ---
rm -rf /app
git clone --depth 1 ${app_repo_url} /app
cd /app/app
logger -t user-data "App cloned"

# --- Write env file (quoted EOF prevents bash expansion) ---
cat > .env.production << 'ENVEOF'
DB_HOST=${db_host}
DB_PORT=${db_port}
DB_NAME=${db_name}
DB_USER=${db_user}
DB_PASSWORD=${db_password}
JWT_SECRET=${jwt_secret}
S3_BUCKET_NAME=${s3_bucket}
AWS_REGION=${aws_region}
PORT=3001
ENVEOF
logger -t user-data "Env file created"

# --- Install dependencies ---
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
logger -t user-data "Running npm ci..."
npm ci --prefer-offline
if [ $? -ne 0 ]; then
    logger -t user-data "ERROR: npm ci failed"
    exit 1
fi
logger -t user-data "Dependencies installed"

# --- Build ---
logger -t user-data "Running npm run build..."
npm run build
if [ $? -ne 0 ]; then
    logger -t user-data "ERROR: npm run build failed"
    exit 1
fi
logger -t user-data "Build completed"

# --- Copy standalone output ---
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/ 2>/dev/null || true
cp .env.production .next/standalone/

# --- Start app ---
logger -t user-data "Starting app on port 3001..."
set -a; source .env.production; set +a
pm2 start .next/standalone/server.js --name "competitor-tracker" --update-env
pm2 save
logger -t user-data "=== Bootstrap complete — app running on port 3001 ==="
