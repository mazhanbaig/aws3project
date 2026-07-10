# Error Report — Competitor Tracker Build

> Generated from EC2 user-data.log (`i-032293f81e7ad13c3`) and local `npm run build`

---

## ❌ Error 1: `pngjs` Missing TypeScript Declarations

**File:** `src/lib/visual-diff.ts`
**Line:** 2
**Error:**
```
Type error: Could not find a declaration file for module 'pngjs'.
'/app/app/node_modules/pngjs/lib/png.js' implicitly has an 'any' type.
```
**Why:** The `pngjs` npm package (v7) does not include TypeScript type definitions.
**Fix:** Create a declaration file at `src/types/pngjs.d.ts` declaring the module, or install `@types/pngjs` if available.

**Status:** ✅ Already fixed — `src/types/pngjs.d.ts` created (commit `8fb865c`)

---

## ❌ Error 2: `jsonwebtoken` Incompatible with Next.js Edge Runtime

**File:** `src/middleware.ts` → imports `getUserFromRequest` from `src/lib/auth.ts` → uses `jsonwebtoken`
**Error:**
```
jsonwebtoken uses process.nextTick which is not supported in Edge Runtime
```
**Why:** 
- Next.js middleware runs on Edge Runtime by default
- Edge Runtime does not support Node.js APIs like `process.nextTick`
- `jsonwebtoken` internally uses `process.nextTick`
**Fix:** Rewrite middleware to not import `jsonwebtoken`. Just check if a cookie exists without decoding the JWT. The real verification already happens inside API routes.

**Status:** ✅ Already fixed — middleware rewritten to be Edge-compatible (commit `8fb865c`)

---

## ❌ Error 3: `.env.production` File Not Found During Deploy

**Where:** SSM deploy command / EC2 startup script
**Error:**
```
source: .env.production: file not found
```
**Why:** The `.env.production` file lives at `/app/app/.env.production` but the SSM command runs from a different working directory (`/var/lib/amazon/ssm/.../`)
**Fix:** `cd /app/app` before running commands, or use absolute paths.

**Status:** ❌ Not fixed — deploy command needs to specify `workingDirectory: ["/app/app"]`

---

## ❌ Error 4: Database Connection Refused (`ECONNREFUSED`)

**When:** POST `/api/auth/signup` returns HTTP 500
**Error:**
```
ECONNREFUSED 127.0.0.1:5432
```
**Why:**
- The app is trying to connect to Postgres on **localhost** (`127.0.0.1:5432`)
- The RDS database is at `competitor-tracker-db.cozwkoekykt4.us-east-1.rds.amazonaws.com:5432`
- The `.env.production` file contains the correct RDS endpoint, but the **environment variables aren't being passed to PM2** when the server starts
- `db.ts` falls back to `'localhost'` when `DB_HOST` env var is not set:
  ```ts
  host: process.env.DB_HOST || 'localhost',
  ```

**Fix:** Make sure the DB env vars reach the running app. Options:
  1. Pass them directly to PM2: `pm2 start server.js --env DB_HOST=...`
  2. Create a `.env` file in the standalone directory that `db.ts` reads
  3. Fix the user-data script to properly export env vars before `pm2 start`

**Root cause confirmed via PM2 logs:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
    at /app/app/.next/standalone/node_modules/pg-pool/index.js:45:11
    at async i (/app/app/.next/standalone/.next/server/app/api/auth/signup/route.js:1:2850)
```

**What was found:**
- `.env.production` does NOT exist at `/app/app/` or `/app/app/.next/standalone/`
- PM2 process has NO `DB_HOST`, `DB_USER`, `DB_PASSWORD`, or `JWT_SECRET` env vars
- The user-data script fails during `npm run build` (pngjs types) BEFORE reaching the `cat > .env.production` step, so the env file is never created
- Health endpoint `/api/health` works because it doesn't touch the DB

**Fix:**
1. Create `.env.production` on EC2 via SSM with correct values
2. Restart PM2 with env vars loaded
3. Fix user-data script: move env file creation BEFORE the build

**Status:** ❌ Not fixed — about to fix now

---

## ✅ Build Status (Local)

After applying fixes for errors 1 & 2, local build passes:

```
✓ Compiled successfully
✓ Linting and checking completed successfully
✓ Generating static pages (10/10)
✓ Collecting build traces...
✓ Finalizing page optimization...
```

---

## 📍 App URL
http://3.212.52.132:3000 (app is running! But signup/login return 500 due to Error 4)

## 🌩️ EC2 Instance
- **ID:** `i-032293f81e7ad13c3`
- **Status:** running
- **Last boot:** 2026-07-10T09:45:21 UTC
- **Security group:** `competitor-tracker-ec2-sg-v2` (port 3000 open to all)
- **Database:** `competitor-tracker-db.cozwkoekykt4.us-east-1.rds.amazonaws.com:5432`
