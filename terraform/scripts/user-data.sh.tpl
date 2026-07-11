#!/bin/bash
# Redirect all output to log file (simple, reliable)
exec 1>/var/log/user-data.log 2>&1
set -u

log() {
  echo "[$(date)] $*"
  logger -t user-data "[$(date)] $*"
}

log "Starting user-data bootstrap..."

# 2GB swapfile — prevent OOM on t3.micro
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
log "Swapfile configured"

# Install Node.js 20 LTS
dnf install -y nodejs git npm 2>&1
log "Node.js $(node -v) installed"

# Skip Puppeteer Chromium download for faster npm ci
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install PM2
npm install -g pm2 2>&1
log "PM2 installed"

# Clone repo
rm -rf /app
git clone --depth 1 ${app_repo_url} /app 2>&1
cd /app/app
log "App cloned"

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
log "Env file created"

# Install dependencies
log "Running npm ci..."
npm ci --prefer-offline 2>&1
CI_EXIT=$?
if [ $CI_EXIT -ne 0 ]; then
  log "ERROR: npm ci failed with exit code $CI_EXIT"
  exit 1
fi
log "Dependencies installed"

# Build
log "Running npm run build..."
npm run build 2>&1
BUILD_EXIT=$?
if [ $BUILD_EXIT -ne 0 ]; then
  log "ERROR: npm run build failed with exit code $BUILD_EXIT"
  exit 1
fi
log "Build completed"

# Copy to standalone output
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/ 2>/dev/null || true
cp .env.production .next/standalone/

# Start app
log "Starting app on port 3001..."
set -a; source .env.production; set +a
pm2 start .next/standalone/server.js --name "competitor-tracker" --update-env 2>&1
PM2_EXIT=$?
if [ $PM2_EXIT -ne 0 ]; then
  log "ERROR: pm2 start failed with exit code $PM2_EXIT"
  exit 1
fi
pm2 save 2>&1
log "Bootstrap complete — app running on port 3001"
