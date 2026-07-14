#!/bin/bash -x
echo "[user-data] === Starting user-data bootstrap ==="

dd if=/dev/zero of=/swapfile bs=1M count=2048 && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

dnf install -y nodejs20 git
npm install -g pm2

if [ ! -f /app/.next/standalone/server.js ]; then
  echo "[user-data] No pre-built app found, cloning and building..."
  rm -rf /app
  git clone --depth 1 -b ${app_branch} ${app_repo_url} /app
  cd /app/app
  cat > .env.production <<ENVEOF
NEXT_PUBLIC_API_URL=${api_gateway_url}
ENVEOF
  npm install --no-audit --no-fund || exit 1
  npm run build || exit 1
  cp -r .next/static .next/standalone/.next/
  cp -r public .next/standalone/ 2>/dev/null || true
  cp .env.production .next/standalone/
else
  echo "[user-data] Pre-built app found, starting directly..."
fi

export PORT=3001
pm2 start .next/standalone/server.js --name "projectfolio" --update-env
pm2 save
echo "[user-data] === ProjectFolio running on port 3001 ==="
