# ProjectFolio

> **A full-stack, cloud-native portfolio platform** — Developers showcase projects, discover others' work, and get noticed.

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![AWS](https://img.shields.io/badge/AWS-FF9900?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)
[![Terraform](https://img.shields.io/badge/Terraform-7B42BC?logo=terraform&logoColor=white)](https://www.terraform.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

---

## ✨ Features

- **Developer Profiles** — Create portfolios with avatar, display name, and project showcase
- **Project Showcase** — Add projects with title, description, tech stack, GitHub/live URLs
- **JWT Authentication** — Secure HttpOnly cookie-based auth
- **Serverless API** — Lambda functions for auth and project CRUD operations
- **Production Infrastructure** — ALB + EC2 on AWS via Terraform

## 🏗 Architecture

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **Backend** | Lambda API + Next.js API Routes, PostgreSQL, JWT, bcrypt |
| **Database** | AWS RDS PostgreSQL |
| **Storage** | AWS S3 (snapshots) |
| **Compute** | AWS EC2 |
| **Load Balancer** | AWS ALB |
| **Infrastructure** | Terraform (HCL) |
| **Process Manager** | PM2 |

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/mazhanbaig/aws3project.git
cd aws3project/app

# Install dependencies
npm ci

# Set up environment
cp .env.local.example .env.local
# Edit .env.local with your database credentials

# Run development server
npm run dev
```

## ☁️ AWS Services Deployed

| Service | Purpose |
|---------|---------|
| **VPC** | Isolated network with public/private subnets |
| **EC2** | App server with Launch Template |
| **ALB** | Application Load Balancer (HTTP/HTTPS) |
| **RDS** | PostgreSQL database (db.t3.micro) |
| **Lambda** | Serverless API functions (7 total) |
| **API Gateway** | REST API endpoint |
| **S3** | Snapshots bucket with versioning |
| **IAM** | EC2/Lambda role-based access |
| **CloudWatch** | Logs, metrics, CPU alarms |
| **VPC Endpoints** | Private CloudWatch access |

## ☁️ Deploy to AWS

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your secrets
terraform init
terraform apply
```

## 📚 Comprehensive Report

For a **detailed 13-section architecture report** covering the system design, infrastructure, data flow, security, API reference, cost analysis, and lessons learned, see:

➡️ **[ARCHITECTURE.md](./ARCHITECTURE.md)**

## 📸 Live Demo

**App URL**: http://competitor-tracker-alb-765681664.us-east-1.elb.amazonaws.com

## 🛠 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Lambda API (Node.js), PostgreSQL, JWT, bcrypt
- **Infrastructure**: Terraform, AWS (VPC, EC2, ALB, RDS, S3, Lambda, API Gateway, IAM, CloudWatch)

## 📬 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/signup` | Create account |
| POST | `/auth/login` | Sign in |
| GET | `/projects` | List all projects |
| GET | `/projects/{id}` | Get single project |
| POST | `/projects` | Create project |
| DELETE | `/projects/{id}` | Delete project |
| GET | `/users/{id}` | Get user profile |

## 📊 Database Schema

```
users → projects
```

Each project has: title, description, tech_stack, github_url, live_url, image_url, featured

## 🧪 Tests

```bash
cd app && npm test
```

Tests for authentication and database utilities.

## 📄 License

Open source — contributions welcome!

---

*Built with Next.js, TypeScript, Terraform & AWS*
