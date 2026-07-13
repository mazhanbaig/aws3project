# Project Assessment: Competitor Tracker

## Is it good?

### What's actually good:
- Full-stack Next.js 14 app with SSR, auth, API routes, DB layer
- Production-grade Terraform infra (VPC, ALB, RDS, S3, ASG, IAM, CloudWatch)
- Visual diff engine (Puppeteer + pixelmatch) — non-trivial engineering
- 100% test pass rate, clean build
- Well-structured code, good separation of concerns
- Comprehensive architecture documentation

### What's NOT good:

| Issue | Severity |
|-------|----------|
| **Deployment broken** (502 Bad Gateway) | 🔴 Critical |
| **Secrets in tfvars committed** (`db_password`, `jwt_secret` in plaintext) | 🔴 Security risk |
| **No real user value** — who actually needs a competitor tracker? Niche B2B tool | 🟡 High |
| **Heavy infra cost** (~$41/mo for ALB + RDS + EC2) for zero users | 🟡 High |
| **UI/UX is basic** — functional but not impressive for a portfolio piece | 🟡 Medium |
| **No notifications** (promised in UI but not implemented) | 🟡 Medium |
| **No tests for API routes or UI** (only scraper tests) | 🟡 Medium |
| **Hard to demo** — needs real competitor URLs to show value | 🟡 Medium |
| **Server.js hardcodes port 3000** while infra expects 3001 | 🟢 Low |
| **SSM agent not connected** — can't debug the EC2 instance | 🟢 Low |

### Verdict:
The engineering is solid, but the product/market fit is weak. It's a **solution looking for a problem**. The infra code is the best part; the app itself is over-engineered for what it does.

---

## Recommendation: Build a Movie App Instead

### Why a Movie App?

| Factor | Rating | Why |
|--------|--------|-----|
| **Simplicity** | ⭐⭐⭐⭐⭐ | Standard CRUD + external API — well-understood patterns |
| **Speed to build** | ⭐⭐⭐⭐⭐ | TMDB API gives you all the data; you just build the UI + backend |
| **WOW factor** | ⭐⭐⭐⭐⭐ | Trailers, posters, search — visually impressive instantly |
| **Portfolio value** | ⭐⭐⭐⭐⭐ | Everyone understands movies; shows you can build something real |
| **Terraform reuse** | ⭐⭐⭐⭐⭐ | Same VPC/ALB/RDS/S3 infra works unchanged |
| **Demo-ability** | ⭐⭐⭐⭐⭐ | Anyone can open it and search for a movie — no setup needed |

### Feature Set (Intermediate, Fast to Build)

```
Core (MVP — 2 days):
├── Landing page (hero, trending movies, search bar)
├── Movie detail page (poster, synopsis, rating, genres)
├── Watchlist (add/remove movies, persisted in DB)
├── Trailer embedding (YouTube from TMDB)
└── Auth (signup/login — reuse existing code)

Nice-to-have (stretch):
├── Search with debounce
├── Category browsing (popular, top-rated, upcoming)
├── User reviews/ratings
└── Infinite scroll on search results
```

### What stays from the current project:
- Terraform infra (VPC, ALB, RDS, S3, IAM, CloudWatch) — **no changes needed**
- Auth system (JWT, bcrypt, middleware, login/signup pages) — **reuse as-is**
- Database layer (connection pool, schema init) — **reuse as-is**
- Tailwind config, layouts, error boundary — **reuse as-is**
- Deployment pipeline (user-data, PM2, GitHub Actions) — **reuse as-is**

### What gets replaced:
- API routes (tracked-pages, scraper, scheduler, screenshot, visual-diff) → Movies + Watchlist + TMDB proxy
- Pages (dashboard, page detail) → Movie detail, search results, watchlist
- S3 upload/scraper/puppeteer — **removed** (simplifies the stack significantly)

### Estimated effort:
- **2-3 days** for a fully functional app with all features
- **Same-day deploy** using existing Terraform (just change the app code)

### The real advantage:
You get to **reuse all your existing AWS infrastructure** (which is the genuinely impressive part) while replacing the app with something people actually want to use and see. Best of both worlds.
