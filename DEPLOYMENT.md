# Deployment Plan — Ebella Furniture Catalog

End-to-end recipe for shipping the stack:

- **Backend** — Spring Boot 3.3 / Java 21
- **Frontend** — React + Vite SPA served by nginx
- **Database** — PostgreSQL 16
- **Storage** — local filesystem today, swap for S3-compatible later

The repo ships:

- `backend/Dockerfile` — multi-stage build → `eclipse-temurin:21-jre-alpine`
- `frontend/Dockerfile` + `frontend/nginx.conf` — multi-stage build →
  `nginx:1.27-alpine`, SPA + reverse proxy in one image
- `infra/docker-compose.yml` + `infra/.env.example` — full stack for
  local / staging
- `backend/.env.example` — backend-only env reference

---

## 1. Architecture options

### A. Single-host with docker-compose (simplest)

```
                Internet
                    │
                    ▼
        ┌──────────────────────┐
        │ TLS terminator       │   Caddy / Cloudflare Tunnel / nginx-proxy
        │ (issues Let's Encrypt│   (separate compose project, optional)
        │  cert, ports 80/443) │
        └──────────┬───────────┘
                   │ http
                   ▼
        ┌──────────────────────┐
        │  ebella-frontend     │   nginx:1.27 + Vite build
        │  (port 80 in net)    │
        │   ├ /                → SPA static files
        │   ├ /api/*           → backend:8080
        │   ├ /media/*         → backend:8080  (cached 7d)
        │   └ /healthz         → 200 ok
        └──────────┬───────────┘
                   │ docker network: internal
        ┌──────────┴───────────┐
        ▼                      ▼
  ┌─────────────┐        ┌──────────────┐
  │ ebella-     │        │ ebella-db    │
  │ backend     │◄──────►│ postgres:16  │
  │ (Spring)    │        │ + volume     │
  └──────┬──────┘        └──────────────┘
         │ writes
         ▼
   uploads volume
   (host-mounted in prod)
```

Pros: one host, one `docker compose up`, easy to reason about.
Cons: vertical scaling only; uploads live on the same disk.

### B. Managed services (recommended for prod at scale)

```
  CDN (Cloudflare / Fastly)
       │ caches /assets/* and /media/*
       ▼
  HTTPS LB (ALB / Caddy / Nginx)
       │
   ┌───┴───┐
   ▼       ▼
 Frontend  Backend (1..N replicas)
 (static   │
  on CDN   ▼
  origin)  Managed Postgres (RDS / Cloud SQL / Neon)
           │
           ▼
           Object storage (S3 / R2 / GCS)
```

Switch points in this codebase:

- Move uploads off local disk: implement `S3StorageService` behind
  `@ConditionalOnProperty(provider=s3)` + flip `APP_STORAGE_PROVIDER=s3`.
- Move Postgres: drop the `db` service from compose; point
  `SPRING_DATASOURCE_URL` at the managed instance.
- Move static SPA to a CDN: build `npm run build`, sync `dist/` to the
  bucket; have the CDN proxy `/api` and `/media` to the backend.

### C. Kubernetes

The compose file translates 1:1 to a Helm chart or three Deployments
(frontend / backend / Postgres if not managed) plus an Ingress. The
JVM args in `backend/Dockerfile` already use `MaxRAMPercentage` so
container memory limits are respected.

---

## 2. Environment variable checklist

### Compose-level (`infra/.env`)

| Variable | Required | Notes |
|---|---|---|
| `PUBLIC_SITE_URL` | ✓ | Browser-facing origin. Drives CORS, image URLs, frontend bundle. Use `https://your-domain` in prod. |
| `PUBLIC_PORT` | – | Host port to expose the frontend on. Default `80`. |
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` | ✓ | Used by the `db` service and re-injected into the backend. |
| `APP_JWT_SECRET` | ✓ | ≥ 32 ASCII characters (256 bits). Generate with `openssl rand -base64 48`. |
| `APP_BOOTSTRAP_ADMIN_ENABLED` | first deploy | Flip true once, set the email/password, then back to false. |
| `APP_BOOTSTRAP_ADMIN_EMAIL` | first deploy | |
| `APP_BOOTSTRAP_ADMIN_PASSWORD` | first deploy | Rotate after first login. |
| `SPRINGDOC_ENABLED` | – | `false` in prod by default. Flip true to expose Swagger temporarily. |

### Backend-only (set directly when running outside compose)

See [`backend/.env.example`](backend/.env.example) for the full list.
Compose injects these for you when you set the compose-level vars above.

### Frontend build-time

The frontend bundle is immutable per build. Vars are baked in at
`docker build` time:

| ARG | Default | Notes |
|---|---|---|
| `VITE_API_BASE_URL` | `/api/v1` | Same-origin in compose (nginx proxies). For a CDN-fronted static site, set this to the absolute backend URL. |
| `VITE_PUBLIC_SITE_URL` | empty | Used by the admin panel for "View site" links; falls back to `window.location.origin`. |

To rebuild with different values:
```bash
docker compose build --build-arg VITE_API_BASE_URL=https://api.ebella.az frontend
```

---

## 3. Build commands

### Local images via compose

```bash
cp infra/.env.example infra/.env
# Edit infra/.env — at minimum APP_JWT_SECRET and POSTGRES_PASSWORD.

docker compose --env-file infra/.env -f infra/docker-compose.yml up -d --build
```

### Independent backend image

```bash
cd backend
docker build -t ghcr.io/your-org/ebella-backend:$(git rev-parse --short HEAD) .
docker push  ghcr.io/your-org/ebella-backend:$(git rev-parse --short HEAD)
```

### Independent frontend image

```bash
cd frontend
docker build \
  --build-arg VITE_API_BASE_URL=https://api.ebella.az \
  --build-arg VITE_PUBLIC_SITE_URL=https://ebella.az \
  -t ghcr.io/your-org/ebella-frontend:$(git rev-parse --short HEAD) .
docker push  ghcr.io/your-org/ebella-frontend:$(git rev-parse --short HEAD)
```

### Without Docker

```bash
# Backend
cd backend && ./mvnw -DskipTests package
java -jar target/furniture-catalog.jar

# Frontend
cd frontend && npm ci && npm run build
# serve dist/ behind any static host (nginx, S3+CloudFront, Netlify…)
```

---

## 4. Static file handling for uploaded media

Uploaded images live under `APP_STORAGE_LOCAL_ROOT` (default
`/var/app/uploads` inside the backend container). The backend exposes
them at `/media/**` via the static resource handler in `WebConfig`.

Strategies, ordered by complexity:

1. **Compose volume (default).** A named volume `uploads` is mounted at
   `/var/app/uploads`; the frontend nginx caches `/media/**` for 7 days.
   Suitable for single-host installs. Back the volume up nightly
   (see §6).
2. **Bind mount with a known host path.** Replace the volume with
   `- /srv/ebella/uploads:/var/app/uploads`. Easier to back up via
   standard host tools (rsync, restic).
3. **Object storage (S3 / R2 / GCS).** Implement `S3StorageService`
   behind `@ConditionalOnProperty(provider=s3)` and set
   `APP_STORAGE_PROVIDER=s3` + bucket creds. The entity model already
   stores `storage_key` (not URL) — no schema changes needed.
   Public URLs use `APP_STORAGE_PUBLIC_BASE_URL`, e.g. the CDN
   pointing at the bucket.

---

## 5. Reverse proxy recommendations

The frontend nginx already proxies `/api/*` and `/media/*` to the
backend, so you only need a thin TLS terminator in front. Two
zero-effort options:

### Caddy (one-line TLS)

`/etc/caddy/Caddyfile`:
```
ebella.az {
  encode zstd gzip
  reverse_proxy ebella-frontend:80
}
```
Run alongside compose (same network) and Caddy auto-issues Let's
Encrypt certs.

### Cloudflare Tunnel

```bash
cloudflared tunnel --url http://ebella-frontend:80
```
Zero open inbound ports, automatic HTTPS, optional WAF rules. Best
for small-to-medium deploys.

### Standalone nginx

If you already run nginx, point a server block at the frontend
container or static `dist/` and proxy `/api`, `/media`, and the
`X-Forwarded-*` headers to the backend.

---

## 6. CORS + domain setup

- **Same-origin (recommended):** SPA + API behind one domain
  (`ebella.az`). The frontend nginx proxies `/api/*` and `/media/*`
  to the backend; the browser never sees a cross-origin request, so
  CORS is a non-issue. `APP_CORS_ALLOWED_ORIGINS` still needs to
  include the public origin in case you also expose the API directly
  for native apps or Postman.
- **Split origins:** SPA on `ebella.az`, API on `api.ebella.az`.
  Set `APP_CORS_ALLOWED_ORIGINS=https://ebella.az,https://admin.ebella.az`
  and rebuild the frontend with `VITE_API_BASE_URL=https://api.ebella.az/api/v1`.
  Cookies are not used (JWT in localStorage), so you don't need
  `withCredentials` plumbing.
- **Subdomains:** If you split admin and public into two SPAs,
  add both origins to `APP_CORS_ALLOWED_ORIGINS`. The current single
  SPA hosts both behind one origin so this isn't needed yet.

DNS:
```
A      ebella.az          → load-balancer / host IP
AAAA   ebella.az          → ::1 form
CNAME  www.ebella.az      → ebella.az
CNAME  admin.ebella.az    → ebella.az      (only if splitting)
CNAME  api.ebella.az      → ebella.az      (only if splitting)
```

---

## 7. Backups

### PostgreSQL

Nightly logical dump is the simplest baseline:

```bash
# Inside the host running compose
docker exec ebella-db pg_dump \
  -U "$POSTGRES_USER" -d "$POSTGRES_DB" -F c -f /tmp/dump.pgc
docker cp ebella-db:/tmp/dump.pgc /backups/ebella-$(date -u +%Y%m%d).pgc
docker exec ebella-db rm /tmp/dump.pgc
```

Wrap in a cron job; rotate with `find /backups -mtime +30 -delete`.

For zero-RPO use a managed Postgres (RDS, Cloud SQL, Neon) with
point-in-time recovery enabled — same connection-string switch.

Restore:
```bash
docker exec -i ebella-db pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean < /backups/ebella-20260423.pgc
```

### Uploaded files

The `uploads` volume / bind-mount is a flat directory tree under
`products/{productId}/variations/{variationId}/...`,
`hero-slides/...`, etc. Either:

- `restic backup` to S3 / B2 / Wasabi nightly; deduplicates, encrypts
  client-side. Recommended.
- `rsync` to an off-host location.
- For object-storage backends, use the provider's native versioning +
  lifecycle rules instead.

Test restores monthly. A backup that hasn't been restored isn't real.

---

## 8. Monitoring + logging

### Logs

- Backend uses SLF4J + structured JSON pattern in prod.
  `TraceIdFilter` puts a `traceId` on every log line and the
  `X-Trace-Id` response header.
- Frontend nginx logs in the standard combined format.
- Aggregate via:
  - **Loki + Promtail** (light) — promtail tails container logs.
  - **Vector → Elasticsearch / OpenSearch** (richer search).
  - **Grafana Cloud / Datadog / Better Stack** (managed).

### Metrics + health

- `GET /actuator/health` and `/actuator/info` are open.
- For richer metrics, add `management.endpoints.web.exposure.include=health,info,metrics,prometheus`
  in `application-prod.yml` and scrape `/actuator/prometheus` from
  a Prometheus that runs alongside.
- Frontend nginx exposes `/healthz` (used by Docker HEALTHCHECK).

### Uptime

- External pinger (UptimeRobot, Better Uptime) hitting
  `https://ebella.az/healthz` and `https://ebella.az/actuator/health`.
- Page on 5xx for 2 consecutive checks.

---

## 9. Production rollout checklist

Run this once per environment.

### Pre-flight

- [ ] DNS A/AAAA records point at the host or load balancer.
- [ ] TLS certificate provisioned (Caddy / cert-manager / Cloudflare).
- [ ] `APP_JWT_SECRET` generated (`openssl rand -base64 48`) and stored
      in your secret manager.
- [ ] `POSTGRES_PASSWORD` rotated to a strong value, stored in secrets.
- [ ] Managed Postgres (if applicable) created with `pgcrypto`,
      `citext`, `ltree`, `pg_trgm` extensions installable.
- [ ] Disk / volume for `uploads` provisioned with adequate free space
      (estimate ~2 MB per uploaded image including renditions).
- [ ] Backup destination reachable from the host.

### Bring-up

- [ ] `git pull` / image pull on the deploy host.
- [ ] `infra/.env` populated from your secret store.
- [ ] First-deploy only: set `APP_BOOTSTRAP_ADMIN_ENABLED=true` and a
      one-time `APP_BOOTSTRAP_ADMIN_PASSWORD`.
- [ ] `docker compose --env-file infra/.env -f infra/docker-compose.yml up -d --build`.
- [ ] Confirm Flyway log line: `Successfully applied 6 migrations…`.
- [ ] Confirm bootstrap log line if seeding:
      `WARN AdminUserSeedRunner — Bootstrap SUPER_ADMIN seeded: …`.
- [ ] Sign in to `/admin/login`, rotate the password.
- [ ] Set the WhatsApp number, contact info, and at least one hero slide.
- [ ] Flip `APP_BOOTSTRAP_ADMIN_ENABLED=false` and redeploy.

### Smoke tests

- [ ] `curl -fsS https://ebella.az/healthz` → `ok`.
- [ ] `curl -fsS https://ebella.az/api/v1/public/categories` returns `[]`
      (or your seeded tree).
- [ ] Open `https://ebella.az` — homepage renders, hero slider visible.
- [ ] Open `https://ebella.az/admin/login` — sign in succeeds.
- [ ] Upload a variation image; confirm the URL under `/media/...`
      resolves with the correct `Cache-Control`.

### Post-deploy

- [ ] Backup cron running (`pg_dump` + `restic`).
- [ ] Uptime monitor configured.
- [ ] Log aggregator receiving from `ebella-backend` and
      `ebella-frontend`.
- [ ] Document the rollback path: `docker compose pull && docker compose up -d`
      with a previous tag pinned in `infra/.env` (use `BACKEND_TAG`,
      `FRONTEND_TAG` overrides if you parameterise the compose file).

### Rollback (if a deploy goes wrong)

1. `docker compose -f infra/docker-compose.yml down`.
2. Pin the previous good image tags in `infra/.env`.
3. `docker compose -f infra/docker-compose.yml up -d`.
4. Flyway never reverses a migration — if a schema change is the
   culprit, restore from the latest dump after rolling back to the
   pre-migration backend image.

Migration discipline: always ship additive migrations (add column,
backfill, then read; deprecate column in a later release). Never edit
or delete a versioned migration once it's in `main`.
