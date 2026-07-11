# Competitor Tracker

> **A full-stack, cloud-native competitor monitoring platform** — Track pricing, features, and content changes across competitor websites with automated text and visual diffing.

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![AWS](https://img.shields.io/badge/AWS-FF9900?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)
[![Terraform](https://img.shields.io/badge/Terraform-7B42BC?logo=terraform&logoColor=white)](https://www.terraform.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

---

## ✨ Features

- **Automated Monitoring** — Track competitor web pages hourly, daily, or weekly
- **Smart Diff Engine** — Unified text diff with added/removed line highlighting
- **Visual Screenshots** — Full-page screenshots with pixel-level visual comparison
- **Change History** — Complete timeline of all detected changes
- **JWT Authentication** — Secure HttpOnly cookie-based auth
- **Production Infrastructure** — ALB + ASG on AWS via Terraform

## 🏗 Architecture

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes, node-postgres, JWT, bcrypt |
| **Browser Automation** | Puppeteer, pixelmatch, pngjs |
| **Database** | AWS RDS PostgreSQL |
| **Storage** | AWS S3 (snapshots, screenshots) |
| **Compute** | AWS EC2 (Auto Scaling Group) |
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

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Inter + JetBrains Mono fonts
- **Backend**: Next.js API Routes, PostgreSQL (node-postgres), JWT (jsonwebtoken), bcrypt
- **Automation**: Puppeteer (headless Chrome), pixelmatch (visual diff), pngjs
- **Infrastructure**: Terraform, AWS (EC2, ALB, RDS, S3, CloudWatch, IAM)
- **Deployment**: GitHub Actions, AWS SSM, PM2

## 📬 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/health` | Health check |
| GET | `/api/tracked-pages` | List tracked pages |
| POST | `/api/tracked-pages` | Add page to track |
| DELETE | `/api/tracked-pages/:id` | Remove page |
| GET | `/api/tracked-pages/:id/changes` | Change history |
| POST | `/api/tracked-pages/:id/check-now` | Trigger check |
| GET | `/api/tracked-pages/:id/visual-diff` | Visual diff image |

## 📊 Database Schema

```
users → tracked_pages → snapshots → changes
                             ↓
                           S3 Bucket (HTML + screenshots)
```

## 🧪 Tests

```bash
cd app && npm test
```

11 tests covering the scraper/diff engine.

## 📄 License

Open source — contributions welcome!

---

*Built with Next.js, TypeScript, Terraform & AWS*
