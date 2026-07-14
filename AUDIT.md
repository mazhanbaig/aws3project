# Infrastructure Audit: Competitor Tracker

**Date:** July 14, 2026  
**ALB URL:** `http://competitor-tracker-alb-910172219.us-east-1.elb.amazonaws.com`  
**Region:** us-east-1

---

## Reference Architecture vs Current State

| Component | Reference | Current | Status |
|-----------|-----------|---------|--------|
| **CI/CD Pipeline** | Push → Test → Packer → Terraform → ASG Refresh | Push → Test → Terraform → SSM deploy | ⚠️ Partial |
| **Packer AMI Baking** | Packer bakes new AMI on app changes | Not implemented | ❌ Missing |
| **Auto Scaling Group** | ASG across 2 AZs with instance refresh | Single EC2 instance (no ASG) | ❌ Missing |
| **Launch Template AMI** | AMI passed as variable from pipeline | Hardcoded via `data.aws_ami` | ❌ Misaligned |
| **ALB** | Public ALB with health checks | Public ALB with health checks | ✅ Done |
| **Route 53 + ACM** | DNS record + SSL certificate | No Route 53, no ACM cert | ❌ Missing |
| **VPC** | VPC with public/private subnets, IGW | VPC with 2 public + 2 private subnets, IGW | ✅ Done |
| **RDS** | Primary + Standby across AZs | Single-AZ PostgreSQL 15 | ⚠️ Partial |
| **RDS Encryption** | KMS encrypt/decrypt | No KMS, no encryption | ❌ Missing |
| **KMS** | KMS key for RDS | Not implemented | ❌ Missing |
| **S3** | Build artifacts + images | Bucket exists (versioning + no public access) | ⚠️ Partial |
| **S3 Encryption** | Server-side encryption | Not configured | ❌ Missing |
| **CloudWatch Alarms** | Alarms tied to ASG scaling policies | CPU alarm exists but no actions/scaling | ⚠️ Partial |
| **Scaling Policies** | CPU/request-count based ASG scaling | None | ❌ Missing |
| **Security Groups** | Least-privilege access | Good: EC2←ALB, RDS←EC2+Lambda, ALB←Internet | ✅ Done |
| **Lambda/API Gateway** | (Existing) | 7 Lambda functions + API Gateway | ✅ Done |
| **VPC Endpoints** | CloudWatch Logs endpoint | Endpoint exists in private subnets | ✅ Done |

---

## Detailed Findings

### 1. CI/CD Pipeline (`deploy.yml`)

**What exists:**
- Change detection (app vs terraform changes)
- Test job (typecheck + tests)
- Terraform plan/apply job
- Deploy via SSM (git pull → build → pm2 restart)

**What's missing:**
- ❌ No Packer AMI baking step
- ❌ No build artifact upload to S3
- ❌ No ASG instance refresh trigger
- ❌ Deploy uses `git pull` on EC2 instead of AMI-based deployment
- ❌ No artifact versioning

**Current deploy flow:**
```
git push → GitHub Actions → SSM: git pull + npm build + pm2 restart
```

**Reference deploy flow:**
```
git push → GitHub Actions → Packer bake AMI → Terraform apply (new AMI) → ASG instance refresh
```

### 2. Packer Templates

**Status:** ❌ No Packer templates exist anywhere in the project.

**Needed:**
- `packer/base.pkr.hcl` - Base template with runtime (Node.js 20)
- `packer/app.pkr.hcl` - App-specific template pulling from S3
- Or a single combined template

### 3. EC2 / Auto Scaling Group (`asg.tf`)

**What exists:**
- Launch template with Amazon Linux 2023
- Single EC2 instance (not in ASG)
- Elastic IP attached to instance
- Target group attachment on port 3001
- User-data script for initial bootstrap

**What's missing:**
- ❌ No `aws_autoscaling_group` resource
- ❌ No ASG across 2 AZs
- ❌ No instance refresh configuration
- ❌ Launch template AMI is hardcoded via data source (not variable)
- ❌ No min/max/desired capacity settings

**Critical issue:** The `aws_instance` resource is used directly instead of an ASG. This means:
- No automatic scaling
- No instance refresh (can't deploy new AMIs without replacing instance)
- Single point of failure

### 4. ALB (`alb.tf`)

**What exists:**
- Application Load Balancer (internet-facing)
- Target group on port 3001 with health checks
- HTTP listener (port 80)
- Optional HTTPS listener (port 443) - not enabled
- ALB Security Group

**What's missing:**
- ❌ No Route 53 DNS record
- ❌ No ACM certificate (variable exists but empty)
- ❌ No sticky sessions (if needed)

**Health check config:** ✅ Good - checks `/` on port 3001, expects 200

### 5. Route 53 + ACM

**Status:** ❌ Not implemented

**Needed:**
- ACM certificate for the domain
- Route 53 A/AAAA record aliasing to ALB
- HTTPS listener using ACM cert
- HTTP → HTTPS redirect

### 6. RDS (`rds.tf`)

**What exists:**
- PostgreSQL 15 on db.t3.micro
- Subnet group across private subnets
- CloudWatch log exports enabled
- Security group allowing EC2 + Lambda access

**What's missing:**
- ❌ No Multi-AZ (no standby in second AZ)
- ❌ No KMS encryption
- ❌ No backup configuration (uses defaults)
- ❌ No performance insights
- ❌ No deletion protection

**Note:** The app does use RDS (Lambda functions connect to it). This is confirmed by:
- `terraform/lambdas/shared/db.js` - PostgreSQL connection pool
- Lambda environment variables include `DB_HOST`, `DB_PASSWORD`
- RDS security group allows Lambda access

### 7. KMS

**Status:** ❌ Not implemented

**Needed:**
- KMS key for RDS encryption
- KMS key policy allowing RDS service

### 8. S3 (`s3.tf`)

**What exists:**
- S3 bucket with versioning enabled
- Public access fully blocked
- Used for Lambda deployment packages and snapshots

**What's missing:**
- ❌ No server-side encryption (SSE-S3 or SSE-KMS)
- ❌ No lifecycle rules for artifact cleanup
- ❌ No build artifact folder structure
- ❌ No bucket policy for EC2/EC2 instance profile access (IAM policy exists)

### 9. CloudWatch (`cloudwatch.tf`)

**What exists:**
- Log group `/aws/ec2/competitor-tracker` (7-day retention)
- High CPU alarm (70% threshold, 2 periods)

**What's missing:**
- ❌ CPU alarm has NO `alarm_actions` (empty list)
- ❌ No SNS topic for notifications
- ❌ No ASG scaling policy connected to alarm
- ❌ No request count/target tracking alarm
- ❌ No memory/disk alarms
- ❌ No ALB-level alarms (5xx errors, latency)

### 10. Security Groups (`security-groups.tf`)

**What exists (well-configured):**
- EC2 SG: Inbound 3001 from ALB only, optional SSH from specific IP
- RDS SG: Inbound 5432 from EC2 + Lambda only
- ALB SG: Inbound 80/443 from anywhere
- Lambda SG: All outbound
- VPC Endpoint SG: HTTPS from VPC CIDR

**Assessment:** ✅ Security groups are properly scoped with least-privilege access.

### 11. IAM (`iam.tf`)

**What exists:**
- EC2 instance profile with SSM + S3 access
- GitHub Actions IAM user with EC2 describe + SSM command permissions

**What's missing:**
- ❌ No CloudWatch agent permissions for EC2
- ❌ GitHub Actions policy doesn't include ASG/Packer/S3 upload permissions
- ❌ No ASG describe permissions in GitHub Actions policy

### 12. Lambda Functions

**What exists (fully functional):**
- 7 Lambda functions (auth-signup, auth-login, projects CRUD, users-get)
- API Gateway with CORS
- Lambda VPC access to RDS
- Shared auth/db modules

**Assessment:** ✅ Lambda backend is complete and working.

---

## Priority Gap-Fill Plan

### Phase 1: Packer + ASG (Critical - enables proper CI/CD)
1. Create Packer template for AMI baking
2. Convert single EC2 to Auto Scaling Group across 2 AZs
3. Make launch template AMI a variable
4. Add instance refresh capability
5. Update GitHub Actions workflow with Packer step + ASG refresh

### Phase 2: Route 53 + ACM (Important - production-ready)
1. Provision ACM certificate
2. Create Route 53 record pointing to ALB
3. Enable HTTPS listener with ACM cert
4. Add HTTP → HTTPS redirect

### Phase 3: CloudWatch + Scaling (Important - reliability)
1. Create SNS topic for alarm notifications
2. Add ASG scaling policies (target tracking)
3. Connect CloudWatch alarms to scaling policies
4. Add ALB-level alarms (5xx, latency)

### Phase 4: RDS Hardening (Important - data protection)
1. Add KMS key for RDS encryption
2. Enable Multi-AZ for standby
3. Configure backup window + retention
4. Enable deletion protection

### Phase 5: S3 Hardening (Nice-to-have)
1. Add server-side encryption
2. Add lifecycle rules
3. Add build artifact folder structure

---

## Questions for User

1. **RDS:** The app uses RDS (Lambda functions connect to PostgreSQL). Should I add Multi-AZ + KMS encryption?
2. **Domain:** Do you have a domain name for Route 53 + ACM, or should I set up the infrastructure ready for when you add one?
3. **Scaling:** What's the expected traffic? Should I configure ASG min=1, max=3 (or higher)?
4. **SNS Notifications:** Where should alarm notifications go? (email, Slack, etc.)

---

*Generated by infrastructure audit - July 14, 2026*
