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
**Fix Applied:**
- Created `.env.production` on EC2 at `/app/app/` and `/app/app/.next/standalone/` via SSM
- Fixed `user-data.sh.tpl` to create `.env.production` BEFORE `npm run build` so env file exists even if build fails
- SSM deploy now passes env vars directly to `pm2 start` command

**Status:** ✅ Fixed

---

## ❌ Error 4: Signup 500 — RDS SSL Required + Missing Env Vars

**Root cause (two layers):**

**Layer 1:** `.env.production` was never created because user-data script failed during `npm run build` before reaching the `cat > .env.production` step. PM2 had no DB_HOST → fell back to localhost.

**Layer 2:** Even with correct DB_HOST, RDS requires SSL encryption:
```
no pg_hba.conf entry for host "10.0.1.20", user "app", database "competitor_tracker", no encryption
```

**Fixes Applied:**
- `app/src/lib/db.ts` — Added conditional SSL config:
  ```ts
  ssl: process.env.DB_HOST && process.env.DB_HOST !== 'localhost'
    ? { rejectUnauthorized: false }
    : false,
  ```
- `app/src/app/api/auth/signup/route.ts` — Added outer try/catch returning proper JSON on error
- `app/src/app/api/auth/login/route.ts` — Same try/catch pattern
- Created `.env.production` on EC2 with correct values
- PM2 restarted with env vars passed directly

**Verification:**
```
POST /api/auth/signup → HTTP 201 {"user":{"id":1,"email":"finaltest@example.com"}} ✅
POST /api/auth/login  → HTTP 200 {"user":{"id":1,"email":"finaltest@example.com"}} ✅
POST /api/auth/signup (duplicate) → HTTP 409 {"error":"Email already registered"} ✅
```

**Status:** ✅ Fixed

---

## ⚠️ Remaining: Fix 1 — Security Group (No ALB, needs your decision)

The debug plan says to restrict port 3000 to ALB only. But the ALB was already removed during the Free Tier migration. The EC2 connects directly via Elastic IP (no load balancer).

**Options:**
1. **Keep direct access** — Port 3000 open to `0.0.0.0/0` (current, simplest for free tier)
2. **Nginx reverse proxy** — Add nginx on EC2 listening on port 80 → proxy to 3000, then close port 3000
3. **Restore ALB** — Re-add the ALB (costs ~$18/month)

**Status:** ⏳ Needs user decision

---

## ✅ Build & Test Status

| Check | Result |
|-------|--------|
| Local build (`npm run build`) | ✅ Passes |
| Local tests (11) | ✅ All pass |
| Health check | ✅ `{"status":"ok"}` |
| Signup | ✅ HTTP 201 with user data |
| Login | ✅ HTTP 200 with user data |
| Duplicate signup | ✅ HTTP 409 conflict |
| DB users table | ✅ Verified via signup (psql not installed on EC2) |
| bcrypt native binary | ✅ Working (signup succeeded, no ELF errors) |
| Edge Runtime middleware | ✅ Fixed (Edge-compatible) |
| pngjs type declarations | ✅ Fixed |

---

## 📍 App URL
http://3.212.52.132:3000 (fully functional!)

## 🌩️ EC2 Instance
- **ID:** `i-032293f81e7ad13c3`
- **Status:** running
- **Latest commit:** `932b660` (Fix signup 500: RDS SSL config, try/catch on API routes)
- **Security group:** `competitor-tracker-ec2-sg-v2` (port 3000 open to all — needs decision)
- **Database:** `competitor-tracker-db.cozwkoekykt4.us-east-1.rds.amazonaws.com:5432`
