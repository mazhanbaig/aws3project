#!/bin/bash -x
echo "[user-data] === Starting user-data bootstrap ==="

# --- 2GB swapfile (prevents OOM on t3.micro) ---
dd if=/dev/zero of=/swapfile bs=1M count=2048 && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
echo "[user-data] Swapfile configured"

# --- Install Node.js + git ---
dnf install -y nodejs git
echo "[user-data] Node.js $(node -v) installed"

# --- Install PM2 ---
npm install -g pm2
echo "[user-data] PM2 installed"

# --- Clone repo ---
rm -rf /app
git clone --depth 1 ${app_repo_url} /app
cd /app/app
echo "[user-data] App cloned"

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
echo "[user-data] Env file created"

# --- Install dependencies ---
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
echo "[user-data] Running npm ci..."
if ! npm ci --prefer-offline; then
    echo "[user-data] ERROR: npm ci failed"
    exit 1
fi
echo "[user-data] Dependencies installed"

# --- Build ---
echo "[user-data] Running npm run build..."
if ! npm run build; then
    echo "[user-data] ERROR: npm run build failed"
    exit 1
fi
echo "[user-data] Build completed"

# --- Copy standalone output ---
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/ 2>/dev/null || true
cp .env.production .next/standalone/

# --- Start app ---
echo "[user-data] Starting app on port 3001..."
set -a; source .env.production; set +a
pm2 start .next/standalone/server.js --name "competitor-tracker" --update-env
pm2 save
echo "[user-data] === Bootstrap complete — app running on port 3001 ==="
