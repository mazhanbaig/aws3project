# ProjectFolio - URLs

## 🌐 Application URLs

### Frontend (ALB)
```
http://competitor-tracker-alb-765681664.us-east-1.elb.amazonaws.com
```

### Direct EC2 Access
```
http://3.212.52.132:3001
```

### API Gateway (Lambda Backend)
```
https://4w0h6px9i6.execute-api.us-east-1.amazonaws.com/prod
```

---

## 📋 API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| POST | `https://4w0h6px9i6.execute-api.us-east-1.amazonaws.com/prod/auth/signup` | Create account |
| POST | `https://4w0h6px9i6.execute-api.us-east-1.amazonaws.com/prod/auth/login` | Sign in |
| GET | `https://4w0h6px9i6.execute-api.us-east-1.amazonaws.com/prod/projects` | List all projects |
| GET | `https://4w0h6px9i6.execute-api.us-east-1.amazonaws.com/prod/projects/{id}` | Get single project |
| POST | `https://4w0h6px9i6.execute-api.us-east-1.amazonaws.com/prod/projects` | Create project |
| DELETE | `https://4w0h6px9i6.execute-api.us-east-1.amazonaws.com/prod/projects/{id}` | Delete project |
| GET | `https://4w0h6px9i6.execute-api.us-east-1.amazonaws.com/prod/users/{id}` | Get user profile |

---

## 🔗 Quick Links

| Service | URL |
|---------|-----|
| **App (ALB)** | http://competitor-tracker-alb-765681664.us-east-1.elb.amazonaws.com |
| **EC2 Direct** | http://3.212.52.132:3001 |
| **API Gateway** | https://4w0h6px9i6.execute-api.us-east-1.amazonaws.com/prod |
| **GitHub Repo** | https://github.com/mazhanbaig/aws3project |

---

## 🏗️ AWS Resources

| Resource | Details |
|----------|---------|
| **EC2 Instance** | `i-07ef6fee762b4c427` (3.212.52.132) |
| **RDS PostgreSQL** | `competitor-tracker-db` |
| **S3 Bucket** | `competitor-tracker-snapshots-*` |
| **Lambda Functions** | `projectfolio-auth-*`, `projectfolio-projects-*`, `projectfolio-users-*` |

---

*Last updated: July 14, 2026*
