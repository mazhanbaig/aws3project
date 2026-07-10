# Competitor Tracker

A SaaS tool that monitors competitor websites for pricing and feature changes. Logged-in users add competitor URLs, the system periodically fetches those pages, diffs them against the last snapshot, and shows a timeline of what changed.

## Architecture

```
┌─────────────┐     Port 3000     ┌─────────┐
│  End User   │ ────────────────→ │  EC2    │
│  (Browser)  │ ←─────────────── │ (pub)   │
└─────────────┘                   └────┬────┘
                                       │
                          ┌────────────┴────────────┐
                          │                         │
                   ┌──────┴──────┐         ┌───────┴──────┐
                   │  RDS        │         │  S3          │
                   │  (private)   │         │  (snapshots) │
                   │  PostgreSQL  │         │              │
                   └─────────────┘         └──────────────┘
```

- **EC2** (t3.micro, public subnet) — Runs Next.js app on port 3000, Elastic IP for stable URL
- **RDS** (db.t3.micro, private subnet) — PostgreSQL 15, no public access
- **S3** — Stores HTML snapshots with versioning enabled
- **Elastic IP** — Free static IP attached to the EC2 instance
- **No ALB, No NAT Gateway** — 100% Free Tier eligible

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS 3 |
| Backend | Next.js API Routes, TypeScript |
| Database | PostgreSQL 15 via `pg` (no ORM) |
| Auth | JWT (httpOnly cookies), bcrypt |
| Scraping | `fetch` + `cheerio` (no headless browser) |
| Scheduler | `node-cron` (every 30 min sweep) |
| Storage | AWS S3 (HTML snapshot archive) |
| Infra | Terraform 1.6+, AWS |

## Project Structure

```
.
├── app/                          # Next.js application
│   ├── src/
│   │   ├── app/                  # App Router pages & API routes
│   │   │   ├── api/              # All backend endpoints
│   │   │   ├── dashboard/        # Dashboard & detail views
│   │   │   ├── login/            # Login page
│   │   │   └── signup/           # Signup page
│   │   ├── lib/                  # Core logic
│   │   │   ├── auth.ts           # JWT + bcrypt helpers
│   │   │   ├── db.ts             # PostgreSQL pool + schema
│   │   │   ├── s3.ts             # S3 upload/download
│   │   │   ├── scraper.ts        # Fetch + HTML parse + diff
│   │   │   ├── scheduler.ts      # Cron-based page sweeper
│   │   │   └── diff-view.tsx     # Diff utility
│   │   ├── instrumentation.ts    # Server startup hook
│   │   └── middleware.ts         # Auth middleware
│   ├── package.json
│   └── next.config.js
├── terraform/                    # All infrastructure as code
│   ├── versions.tf              # Provider config
│   ├── variables.tf             # All variables
│   ├── vpc.tf                   # VPC, subnets, routing
│   ├── security-groups.tf       # ALB, EC2, RDS SGs
│   ├── alb.tf                   # Load balancer
│   ├── asg.tf                   # Auto Scaling Group + launch template
│   ├── rds.tf                   # PostgreSQL instance
│   ├── s3.tf                    # Snapshots bucket
│   ├── iam.tf                   # EC2 IAM role + policies
│   ├── cloudwatch.tf            # Logs + CPU alarm
│   ├── outputs.tf               # Outputs
│   └── scripts/user-data.sh.tpl  # EC2 bootstrap script
├── .github/workflows/deploy.yml # CI/CD pipeline
└── README.md
```

## Deployment

### Prerequisites

1. **AWS Account** with programmatic access
2. **Terraform 1.6+** installed locally
3. **AWS CLI** configured (`aws configure`)

### Step 1: Configure variables

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your values:

```hcl
aws_region = "us-east-1"

# Generate a strong random password:
# pwgen -s 32 1
db_password = "your-secure-postgres-password"

# Generate a random JWT secret:
# openssl rand -base64 32
jwt_secret = "your-jwt-secret-at-least-32-chars"

# Your public IP for SSH debugging (optional - leave empty for SSM-only)
# curl ifconfig.me
my_ip = ""

# Your forked repo URL
app_repo_url = "https://github.com/your-org/competitor-tracker.git"
```

### Step 2: Deploy infrastructure

```bash
terraform init
terraform plan
terraform apply
```

This provisions: VPC, subnets, EC2 (t3.micro), RDS (db.t3.micro), S3 bucket, IAM roles, CloudWatch, Elastic IP.

The EC2 instance auto-installs Node.js 20, clones the app repo, installs deps, builds, and starts the Next.js server via PM2.

### Step 3: Verify

```bash
terraform output app_url
# → http://1.2.3.4:3000

curl http://$(terraform output -raw app_ip):3000/api/health
# → {"status":"ok"}
```

### Destroy

```bash
terraform destroy
```

**✅ 100% Free Tier eligible — no ALB costs.**

## CI/CD

On push to `main`:
1. Build, typecheck, lint & test the app

Set this GitHub Secret:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

Note: Automated redeploy on push is not configured (requires redeploying the EC2 instance).

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/signup` | No | Create account |
| POST | `/api/auth/login` | No | Sign in (JWT cookie) |
| GET | `/api/health` | No | Health check (ALB target group) |
| GET | `/api/tracked-pages` | Yes | List tracked pages |
| POST | `/api/tracked-pages` | Yes | Add a page to track |
| GET | `/api/tracked-pages/:id` | Yes | Get page details |
| DELETE | `/api/tracked-pages/:id` | Yes | Remove a tracked page |
| POST | `/api/tracked-pages/:id/check-now` | Yes | Trigger immediate check |
| GET | `/api/tracked-pages/:id/changes` | Yes | Change history timeline |
| POST | `/api/tracked-pages/:id/diff-content` | Yes | Get line-by-line diff |

## Design Decisions (scoped out vs. production)

### No NAT Gateway
EC2 lives in public subnets with public IPs. RDS in private subnets has no outbound internet (it doesn't need it). Saves ~$33/month.

### No headless browser
Pages are fetched via plain HTTP GET + `cheerio` text extraction. This avoids Chromium's 300MB+ dependency and system-library headaches on a 1GB instance. JS-rendered SPAs won't be fully captured — that's a v2 enhancement.

### No email/Slack alerts
The tool tracks changes and shows them in the UI. Alerts are a natural v2 addition.

### No multi-tenant/workspace support
Each user sees only their own data. Team features are out of scope.

### No custom domain, no HTTPS
The app runs on HTTP port 3000 with an Elastic IP. No Route53, no ACM. Suitable for personal/development use only.

### Local Terraform state
No S3 backend — single-operator project. Swap to remote state before adding collaborators.

## Estimated Monthly Cost

| Service | Config | Est. Cost |
|---------|--------|-----------|
| EC2 | t3.micro (Free Tier: 750h/month) | **$0** ✅ |
| RDS | db.t3.micro (Free Tier: 750h/month) | **$0** ✅ |
| EIP | Elastic IP attached to running instance | **$0** ✅ |
| S3 | Negligible storage | **$0** ✅ |
| **Total** | | **$0/month** 🎉 |

**100% Free Tier eligible** as long as your AWS account is within the first 12 months.
