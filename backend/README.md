# Furniture Catalog — Backend

Spring Boot 3.3 + Java 21 + PostgreSQL 16 backend for the Furniture Catalog website.

## Stack

- Spring Boot 3.3 (Web, Data JPA, Validation, Security, Actuator)
- Java 21, Maven
- PostgreSQL 16 + Flyway migrations
- Lombok + MapStruct
- springdoc-openapi (Swagger UI)
- Testcontainers for integration tests

## Project layout

```
backend/
├── pom.xml
└── src/main/java/com/company/furniturecatalog/
    ├── FurnitureCatalogApplication.java
    ├── config/          # WebConfig (CORS + /api/v1 prefix + /media), OpenApiConfig, JpaAuditingConfig
    │   └── properties/  # CorsProperties, StorageProperties, JwtProperties
    ├── security/        # SecurityConfig (JWT-ready, stateless)
    ├── controller/      # REST controllers (add per feature)
    ├── service/         # Business logic (add per feature)
    ├── repository/      # Spring Data repositories
    ├── domain/          # JPA entities (BaseEntity here)
    ├── dto/             # Request/response records
    ├── mapper/          # MapStruct mappers
    ├── exception/       # Custom exceptions + GlobalExceptionHandler + ApiError
    └── util/
```

Resources:

```
src/main/resources/
├── application.yml          # Shared config
├── application-dev.yml      # Local development
├── application-prod.yml     # Production (reads env vars)
└── db/migration/
    └── V1__baseline.sql     # Extensions + shared triggers
```

## Prerequisites

- JDK 21
- Maven 3.9+
- Docker (for a local Postgres and for Testcontainers)

## Quick start (dev)

1. Start Postgres locally:
   ```bash
   docker run --name furniture-db -d \
       -e POSTGRES_DB=furniture_catalog \
       -e POSTGRES_USER=furniture \
       -e POSTGRES_PASSWORD=furniture \
       -p 5432:5432 \
       postgres:16-alpine
   ```

2. Run the app with the `dev` profile (the default):
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

   On first run, Flyway applies `V1__baseline.sql`.

3. Verify:
   - API base: http://localhost:8080/api/v1
   - Health:    http://localhost:8080/actuator/health
   - Swagger:   http://localhost:8080/swagger-ui.html
   - OpenAPI:   http://localhost:8080/v3/api-docs

## Global API prefix

All `@RestController` endpoints are served under `/api/v1` — configured in
`WebConfig` via `PathMatchConfigurer.addPathPrefix`. Controllers should use
resource paths like `@RequestMapping("/public/products")` (no `/api/v1` prefix).

## CORS

Driven by `app.cors.*` in `application.yml`. Dev allows `http://localhost:5173`
(Vite) and `5174` (admin). Override in prod with:

```
APP_CORS_ALLOWED_ORIGINS=https://ebella.az,https://admin.ebella.az
```

## File uploads

- Multipart limit: `10MB` per file, `50MB` per request (see `application.yml`).
- Local storage path: `./var/uploads` in dev, `/var/app/uploads` in prod
  (overridable via `APP_STORAGE_LOCAL_ROOT`).
- Files are served as static resources under `/media/**` by `WebConfig`.
- When migrating to S3/GCS, implement `StorageService` with a new provider and
  flip `APP_STORAGE_PROVIDER=s3`. No entity or API changes needed.

## Profiles

| Profile | Purpose |
|---------|---------|
| `dev`   | Local development. Verbose SQL logs, DevTools enabled, open Swagger. |
| `prod`  | Production. All secrets from env vars, access log on, Swagger disabled unless `SPRINGDOC_ENABLED=true`. |
| `test`  | Integration tests. Uses Testcontainers Postgres (`jdbc:tc:postgresql:16-alpine:///...`). |

Select with `SPRING_PROFILES_ACTIVE`.

## Required environment variables (prod)

```
SPRING_PROFILES_ACTIVE=prod
SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/furniture_catalog
SPRING_DATASOURCE_USERNAME=...
SPRING_DATASOURCE_PASSWORD=...
APP_CORS_ALLOWED_ORIGINS=https://ebella.az,https://admin.ebella.az
APP_STORAGE_LOCAL_ROOT=/var/app/uploads
APP_STORAGE_PUBLIC_BASE_URL=https://ebella.az/media
APP_JWT_SECRET=<min 32 random bytes, base64>
```

## Build & run

```bash
# Build (runs unit + integration tests)
./mvnw clean verify

# Package a runnable jar
./mvnw clean package -DskipTests

# Run the jar
java -jar target/furniture-catalog.jar
```

## Database migrations

- Flyway is enabled out of the box.
- Migration files live in `src/main/resources/db/migration`, named `V<n>__<desc>.sql`.
- Validate migrations without applying: `./mvnw flyway:validate`.
- Repair after a failed migration: `./mvnw flyway:repair` (only if you understand why it failed).

## Auditing

- Entities extending `BaseEntity` automatically populate `created_at`, `updated_at`,
  `created_by`, `updated_by`, and `version`.
- The `auditorAware` bean reads the current user id from the JWT principal once a
  principal implementing `JpaAuditingConfig.AuditablePrincipal` is plugged in.

## Error responses

All errors come back in the shape defined by `exception/ApiError.java`:

```json
{
  "timestamp": "2026-04-23T10:12:03Z",
  "status": 400,
  "error": "ValidationFailed",
  "message": "Request validation failed",
  "path": "/api/v1/admin/categories",
  "traceId": null,
  "fieldErrors": [
    { "field": "name", "code": "NotBlank", "message": "must not be blank" }
  ]
}
```

## Next steps

1. Add feature migrations (`V2__categories.sql`, `V3__products.sql`, ...).
2. Implement `StorageService` interface + `LocalFileStorageService`.
3. Add JWT auth (`JwtService`, `JwtAuthFilter`) and wire it into `SecurityConfig`.
4. Build out `catalog/category`, `catalog/product`, `catalog/variation`, `catalog/media`
   feature modules following the clean-architecture layout.
