# Architecture

## Overview

ProjectFolio is a developer portfolio / project showcase app deployed on AWS.

```
Internet
   │
   ├── ALB (port 80)
   │     └── EC2 (port 3001) ─── Next.js app (SSR, API routes, UI)
   │
   └── API Gateway (REST, AWS_PROXY)
         └── Lambda (Node.js 20.x) ─── RDS PostgreSQL 15
               └── CloudWatch Logs (via VPC Endpoint)
```

## Components

### Frontend (EC2 + ALB)
- **EC2** (`t3.micro`, Amazon Linux 2023) runs the Next.js app via `pm2`
- **ALB** terminates HTTP (port 80), forwards to EC2 on port 3001
- Health check: `GET /` on port 3001
- User-data clones the repo, runs `npm install && npm run build`, starts with `pm2`
- Swap file (2 GB) enabled for build memory

### Backend API (Lambda + API Gateway)
- **API Gateway** (REGIONAL, no auth) proxies all requests to Lambda
- **6 Lambda functions** (Node.js 20.x, 256 MB, 30s timeout) in VPC:
  - `auth-signup` — create user, hash password (bcryptjs), return JWT
  - `auth-login` — verify credentials, return JWT
  - `projects-list` — list projects by user (via JWT cookie/header)
  - `projects-create` — create project
  - `projects-get` — get project by ID
  - `projects-delete` — delete project
- Lambda code + `node_modules` bundled into a zip, uploaded to S3
- `source_code_hash` triggers Lambda update on zip change

### Database (RDS)
- **PostgreSQL 15** (`db.t3.micro`, 20 GB gp3)
- Private subnets, `publicly_accessible = false`
- Default DB: `competitor_tracker`
- Tables: `users`, `projects` (created by Lambda `initSchema()`)
- `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` handles schema migrations

### Networking
- **VPC** (`10.0.0.0/16`) with 2 public + 2 private subnets
- **Public subnets:** EC2, ALB, NAT (no NAT Gateway currently), IGW
- **Private subnets:** RDS, Lambda ENIs
- **Security groups:**
  - ALB SG — port 80 from 0.0.0.0/0
  - EC2 SG — port 3001 from ALB SG only
  - RDS SG — port 5432 from EC2 SG + Lambda SG
  - Lambda SG — all outbound
  - VPC Endpoint SG — port 443 from VPC CIDR

### Logging & Monitoring
- **CloudWatch Logs:** EC2 logs to `/aws/ec2/competitor-tracker`
- **Lambda logs** delivered via **VPC Endpoint** (`com.amazonaws.us-east-1.logs`, Interface type, `private_dns_enabled`)
- **CPU alarm:** >80% for 5 minutes triggers SNS notification

### Infrastructure as Code
- All resources defined in `terraform/` and deployed with `terraform apply`
- State stored locally at `terraform/terraform.tfstate`

## Deployment

```bash
cd terraform
terraform apply -auto-approve
```

## URLs

| Service | URL |
|---------|-----|
| ALB (Frontend) | `http://competitor-tracker-alb-910172219.us-east-1.elb.amazonaws.com` |
| API Gateway | `https://4w0h6px9i6.execute-api.us-east-1.amazonaws.com/prod` |
