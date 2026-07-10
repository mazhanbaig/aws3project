# PROGRESS

## Phase 1 — Data Model & Core Logic
- [x] Initialize Next.js project (package.json, configs)
- [x] Database layer (db.ts with schema creation)
- [x] Auth layer (JWT, bcrypt, middleware)
- [x] Scraping/diff engine
- [x] S3 storage layer
- [x] Scheduler
- [x] API routes: auth, tracked-pages, check-now, changes, health
- [x] UI: Dashboard, detail view, login/signup

## Phase 2 — Terraform Infrastructure
- [x] versions.tf, variables.tf
- [x] vpc.tf, security-groups.tf
- [x] alb.tf, asg.tf, rds.tf
- [x] s3.tf, cloudwatch.tf, iam.tf
- [x] outputs.tf, terraform.tfvars.example
- [x] .gitignore

## Phase 3 — EC2 Bootstrap
- [x] user-data.sh.tpl

## Phase 4 — CI/CD
- [x] deploy.yml
- [x] README documentation

## Phase 5 — Credentials & First Run
- [ ] Instructions
- [ ] terraform init/validate/plan/apply

## Phase 6 — Verification
- [ ] All 10 checks

## Phase 7 — Stretch (optional)
- [x] Puppeteer screenshot service (app/src/lib/screenshot.ts)
- [x] Visual diff engine with pixelmatch + pngjs (app/src/lib/visual-diff.ts)
- [x] Visual diff API route (/api/tracked-pages/[id]/visual-diff)
- [x] Screenshot retrieval API route (/api/screenshot/[...key])
- [x] Visual diff UI component with image viewer
- [x] Detail page visual diff tab (text/visual toggle)
- [x] Screenshot toggle in add-page form (dashboard)
- [x] Scheduler/check-now screenshot capture integration
- [x] DB schema: screenshot_enabled, screenshot_s3_key columns
- [x] user-data.sh.tpl: Chromium installation for Puppeteer
- [x] next.config.js: external packages for puppeteer/pngjs/pixelmatch
- [x] Build verified, tests pass
