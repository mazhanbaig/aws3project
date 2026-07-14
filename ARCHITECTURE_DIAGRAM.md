# AWS Architecture Diagram - ProjectFolio

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                    INTERNET                               │
│                                                                              │
│                              ┌───────────────┐                               │
│                              │   CLIENTS     │                               │
│                              └───────┬───────┘                               │
│                                      │ HTTPS/HTTP                            │
└──────────────────────────────────────┼─────────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼─────────────────────────────────────────┐
│                              ┌───────────────┐                               │
│                              │   ALB         │ ◄── Listeners (80, 443)      │
│                              │   (Public)    │                               │
│                              └───────┬───────┘                               │
│                                      │                                       │
└──────────────────────────────────────┼─────────────────────────────────────────┘
                                       │
         ┌───────────────────────────────┼─────────────────────────────────────────┐
         │                             │                                       │
         ▼                             ▼                                       ▼
┌──────────────────┐         ┌──────────────────┐                ┌──────────────────┐
│   EC2 Instance   │         │   Lambda         │                │   Lambda         │
│   (t3.micro)     │         │   (auth-*)       │                │   (projects-*)   │
│                  │         │                  │                │                  │
│  Next.js App     │         │   API Gateway    │                │                  │
│  Port: 3001      │         │   (Public)       │                │                  │
└────────┬─────────┘         └────────┬─────────┘                └────────┬─────────┘
         │                             │                                   │
         │                             │                                   │
         ▼                             ▼                                   ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│                              SECURITY GROUPS                                   │
│  ALB → EC2 (port 3001)     Lambda → RDS (port 5432)                       │
└────────────────────────────────────────────────────────────────────────────────┘
         │                             │
         ▼                             ▼
┌──────────────────┐         ┌──────────────────────────────┐
│  RDS PostgreSQL  │         │   S3 Snapshots Bucket        │
│  (Private)       │         │   - Project data             │
│  db.t3.micro     │         │   - Versioning enabled       │
└──────────────────┘         └──────────────────────────────┘
         │                             │
         ▼                             ▼
┌──────────────────┐         ┌──────────────────────────────┐
│  VPC Flow Logs   │         │   Lambda Deployment Zip      │
│  & Monitoring    │         │   (in S3)                  │
└──────────────────┘         └──────────────────────────────┘
```

## Component Details

### Network Layer
- **VPC**: 10.0.0.0/16
- **Public Subnets**: ALB, EC2 (with Elastic IP)
- **Private Subnets**: RDS, Lambda
- **IGW**: Internet connectivity
- **VPC Endpoint**: CloudWatch Logs (Interface type)

### Compute Layer
- **EC2**: t3.micro with Launch Template + PM2
- **Lambda**: 7 functions (Node.js 20.x) - auth & project CRUD
- **S3**: Lambda deployment zip + project data

### Security Layer
- **IAM Roles**: EC2 instance profile, Lambda execution role
- **Security Groups**: ALB→EC2, EC2→RDS, Lambda→RDS
- **SSM**: Managed instance access (no SSH needed)

### Database Schema
```
users
  └── projects (user_id FK)
```

### API Endpoints
| Method | Endpoint | Service |
|--------|----------|---------|
| POST | `/auth/signup` | Lambda |
| POST | `/auth/login` | Lambda |
| GET | `/projects` | Lambda |
| GET | `/projects/{id}` | Lambda |
| POST | `/projects` | Lambda |
| DELETE | `/projects/{id}` | Lambda |
| GET | `/users/{id}` | Lambda |

## AWS Services Summary

| Category | Service | Resource |
|----------|---------|----------|
| **Network** | VPC, IGW, Subnets, Route Tables | `vpc.tf` |
| **Compute** | EC2, Launch Template, EIP | `asg.tf` |
| **Load Balancer** | ALB, Target Group | `alb.tf` |
| **Database** | RDS PostgreSQL | `rds.tf` |
| **Serverless** | Lambda, API Gateway | `lambda.tf` |
| **Storage** | S3 Bucket | `s3.tf` |
| **Security** | IAM Roles/Profiles/Policies, SGs | `iam.tf`, `security-groups.tf` |
| **Monitoring** | CloudWatch Logs, Alarms, VPC Endpoint | `cloudwatch.tf` |