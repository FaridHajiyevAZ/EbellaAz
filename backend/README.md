# Furniture Catalog — Backend

Spring Boot 3.3 + Java 21 + PostgreSQL 16 backend for the Ebella furniture
catalog. Powers the public website (catalog reads, hero/CMS payloads, contact)
and the admin SPA (CRUD for categories, products, variations, hero slides,
homepage sections, contact info, site settings, and admin users).

---

## Stack

- **Spring Boot 3.3** — Web, Data JPA, Validation, Security, Actuator
- **Java 21** with virtual threads available
- **PostgreSQL 16** with `ltree`, `pg_trgm`, `citext`, `pgcrypto`
- **Flyway** migrations under `src/main/resources/db/migration`
- **Lombok + MapStruct** for entity wiring + DTO mapping
- **JWT (jjwt 0.12)** for stateless admin auth
- **springdoc-openapi** for Swagger UI
- **Testcontainers** for integration tests

## Project layout

```
backend/
├── pom.xml
├── .env.example                         # All recognised env vars (copy to .env)
└── src/main/
    ├── java/com/company/furniturecatalog/
    │   ├── FurnitureCatalogApplication.java
    │   ├── common/web/                  # TraceIdFilter (MDC traceId)
    │   ├── config/                      # WebConfig, OpenApiConfig, JpaAuditing
    │   │   └── properties/              # @ConfigurationProperties records
    │   ├── controller/                  # REST controllers
    │   ├── service/                     # Service interfaces
    │   │   └── impl/                    # Implementations
    │   ├── repository/                  # Spring Data repos + Specifications
    │   │   └── spec/
    │   ├── domain/                      # JPA entities + enums
    │   │   └── enums/
    │   ├── dto/                         # Records (admin/, publicapi/, common/)
    │   ├── mapper/                      # MapStruct mappers
    │   ├── exception/                   # ApiError + GlobalExceptionHandler
    │   ├── security/                    # JWT + Spring Security wiring
    │   ├── storage/                     # StorageService (local impl, S3 later)
    │   └── util/                        # SiteSettingKeys, StorageUrlResolver, …
    └── resources/
        ├── application.yml              # Shared
        ├── application-dev.yml          # Dev profile
        ├── application-prod.yml         # Prod profile
        └── db/migration/
            ├── V1__baseline.sql
            ├── V2__categories.sql
            ├── V3__products_variations_images.sql
            ├── V4__cms.sql
            ├── V5__admin_users.sql
            └── V6__seed_settings.sql
```

---

## Local setup

### 1. Prerequisites

- JDK 21
- Maven 3.9+
- Docker (for Postgres + Testcontainers)

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env if defaults don't match your setup. The defaults assume the
# Postgres container in step 3.
```

The dev profile is enabled by default (`SPRING_PROFILES_ACTIVE=dev`).

### 3. Start Postgres

```bash
docker run --name furniture-db -d \
  -e POSTGRES_DB=furniture_catalog \
  -e POSTGRES_USER=furniture \
  -e POSTGRES_PASSWORD=furniture \
  -p 5432:5432 \
  postgres:16-alpine
```

### 4. (Optional) Bootstrap an admin

The dev profile already enables seeding with a default password
(`ChangeMe123!`). For a custom email/password, override before starting:

```bash
export APP_BOOTSTRAP_ADMIN_ENABLED=true
export APP_BOOTSTRAP_ADMIN_EMAIL=you@example.com
export APP_BOOTSTRAP_ADMIN_PASSWORD=somethingStrong
```

The seed runs once on startup if no active admin exists.

### 5. Run

```bash
./mvnw spring-boot:run
```

On first start Flyway applies V1 → V6, the bootstrap runner (when enabled)
provisions a SUPER_ADMIN, then the app is ready at:

| Surface         | URL                                   |
|-----------------|---------------------------------------|
| API base        | http://localhost:8080/api/v1          |
| Health          | http://localhost:8080/actuator/health |
| Swagger UI      | http://localhost:8080/swagger-ui.html |
| OpenAPI JSON    | http://localhost:8080/v3/api-docs     |
| Local media     | http://localhost:8080/media/...       |

---

## Build, test, package

```bash
./mvnw clean verify          # full build + tests (Testcontainers Postgres)
./mvnw test                  # unit + integration tests
./mvnw spring-boot:run       # dev server
./mvnw package -DskipTests   # produces target/furniture-catalog.jar
java -jar target/furniture-catalog.jar
```

The test profile uses Testcontainers (`jdbc:tc:postgresql:16-alpine:///...`) so
no external DB is required for `mvn verify`.

---

## Profiles

| Profile | Purpose |
|---------|---------|
| `dev`   | Local development. SQL logging on, DevTools on, Swagger on, lenient CORS. |
| `prod`  | Production. All secrets from env vars (no defaults). JSON logs, Swagger off unless `SPRINGDOC_ENABLED=true`. |
| `test`  | Integration tests. Pulls a Postgres container via Testcontainers. |

Select with `SPRING_PROFILES_ACTIVE=prod`.

---

## Environment reference

See [`.env.example`](./.env.example) for the canonical list. Quick reference of
the most-touched values:

| Variable | Required | Default (dev) | Notes |
|---|---|---|---|
| `SPRING_DATASOURCE_URL` | prod | `localhost:5432/furniture_catalog` | JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | prod | `furniture` | |
| `SPRING_DATASOURCE_PASSWORD` | prod | `furniture` | |
| `APP_CORS_ALLOWED_ORIGINS` | prod | `http://localhost:5173,http://localhost:5174` | Comma-separated |
| `APP_STORAGE_PROVIDER` | – | `local` | `local` or `s3` (S3 not yet shipped) |
| `APP_STORAGE_LOCAL_ROOT` | – | `./var/uploads` | Mounted volume in containers |
| `APP_STORAGE_PUBLIC_BASE_URL` | prod | `http://localhost:8080/media` | Used to build image URLs |
| `APP_JWT_SECRET` | prod | _placeholder_ | ≥ 32 chars; use a real secret in prod |
| `APP_BOOTSTRAP_ADMIN_ENABLED` | – | `false` (`true` in dev) | Flip on for first-deploy seeding |
| `APP_BOOTSTRAP_ADMIN_EMAIL` | – | `admin@ebellaaz.local` | |
| `APP_BOOTSTRAP_ADMIN_PASSWORD` | when seeding | – | Required when seeding |
| `SPRINGDOC_ENABLED` | – | `true` (dev) / `false` (prod) | Toggles `/swagger-ui.html` |

---

## API surface

`/api/v1` is applied globally by `WebConfig.configurePathMatch`. Controllers
declare their resource path only.

### Public (anonymous)

| Method | Path | Description |
|---|---|---|
| `GET` | `/public/categories` | Full published category tree |
| `GET` | `/public/products` | Paged product list (filters: `categoryId`, `subtree`, `q`, `featured`, `sort`) |
| `GET` | `/public/products/{slug}` | Product detail (variations, images, breadcrumbs, WhatsApp inquiry) |
| `GET` | `/public/home` | Hero slides + sections |
| `GET` | `/public/contact?locale=` | Primary contact info |
| `GET` | `/public/settings` | Public site settings (`is_public=true`) |

### Admin (Bearer JWT)

`/admin/auth/{login,refresh,me}`, `/admin/categories/...`, `/admin/products/...`,
`/admin/products/{id}/variations`, `/admin/variations/...`,
`/admin/variations/{id}/images/...`, `/admin/hero-slides/...`,
`/admin/home-sections/...`, `/admin/contact-info/...`, `/admin/settings/...`,
`/admin/media/...`. See Swagger UI for the full list.

---

## Database

- All tables use UUID primary keys.
- Soft delete on aggregates that need restore-friendly deletes (`deleted_at`).
- Partial unique indexes ignore soft-deleted rows so undelete is conflict-free.
- Materialised `ltree` `path` on categories for fast subtree queries.
- `tsvector` + GIN index on `products.search_tsv` (maintained by trigger).
- Single `set_updated_at()` trigger reused by every audited table.

Migrations are immutable once shipped — additive changes only after release.

---

## Security

- Stateless: `SessionCreationPolicy.STATELESS`, CSRF disabled.
- BCrypt(12) password hashing.
- HS256 JWTs (`jjwt`); `access` and `refresh` token types tagged via `typ` claim.
- `JwtAuthFilter` re-loads the principal from the DB on every request, so
  disabling or soft-deleting an admin invalidates outstanding tokens immediately.
- Method security enabled (`@EnableMethodSecurity`); add `@PreAuthorize` for
  role-specific endpoints.
- `RestAuthenticationEntryPoint` and `RestAccessDeniedHandler` emit the same
  `ApiError` envelope as the rest of the API.

---

## Logging

- SLF4J everywhere via Lombok `@Slf4j`.
- `TraceIdFilter` adds a per-request UUID to the SLF4J MDC under `traceId`,
  reflects it back as the `X-Trace-Id` response header, and reuses an inbound
  value when present (so a reverse proxy can correlate end-to-end).
- Dev pattern includes the trace id in plain text; prod emits structured JSON
  with the trace id as a top-level field.
- `GlobalExceptionHandler` writes the trace id into every `ApiError` so support
  tickets can quote it.

---

## Storage

- `StorageService` is the seam: `LocalFileStorageService` is wired today via
  `@ConditionalOnProperty(prefix="app.storage", name="provider", havingValue="local")`.
- Files are addressed by `storage_key` everywhere — never URL — so swapping to
  S3 means dropping in an `S3StorageService` with `havingValue="s3"`. No entity
  or API changes required.

Image upload flow: `MultipartFile` → `FileValidator` (type/extension/size) →
`LocalFileStorageService.store(...)` → `StoredFile` returned to caller →
`MediaService` persists the matching DB row.

---

## Troubleshooting

- **`relation "products" does not exist`** — Flyway didn't run. Confirm your
  DB user can create extensions; V1 enables `pgcrypto`, `citext`, `ltree`,
  `pg_trgm`. On managed Postgres these may need to be pre-enabled.
- **`ltree` cast errors** — make sure you didn't drop the V1 extension migration.
- **401 on /admin/** with valid token — verify `APP_JWT_SECRET` matches the value
  used to issue the token; restarting with a different secret invalidates all
  outstanding JWTs.
- **CORS preflight failures** — set `APP_CORS_ALLOWED_ORIGINS` to include both
  the public site and admin origins.
- **First admin login fails** — confirm bootstrap ran:
  `WARN AdminUserSeedRunner — Bootstrap SUPER_ADMIN seeded: ...` should appear
  in the logs once.

---

## Conventions

- Controllers stay thin — service layer owns transactions and business rules.
- Mappers stay pure — services pass any context (URL resolver, prebuilt
  WhatsApp inquiry) as method params; mappers never hit the DB.
- DTOs are records; entities expose only `@Getter`/`@Setter` from Lombok with
  manual id-based `equals`/`hashCode` in `BaseEntity`.
- All `@OneToMany` and `@ManyToOne` are `LAZY`; eager fetches happen via
  `@EntityGraph` on the specific repository methods that need them.
- `spring.jpa.open-in-view: false` — accidental lazy-loading in the view layer
  fails loudly instead of silently issuing extra queries.
