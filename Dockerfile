# =============================================================================
# Ebella Furniture Catalog — single-container image.
#
# One process (Spring Boot) serves the React SPA + the REST API + /media on
# port 8080. This is the image every PaaS (Coolify, Render, Railway, Fly.io,
# Kubernetes) can pick up from the repository root.
#
# Build:        docker build -t ebella .
# Run:          docker run --rm -p 8080:8080 \
#                   -e SPRING_DATASOURCE_URL=jdbc:postgresql://host:5432/db \
#                   -e SPRING_DATASOURCE_USERNAME=... \
#                   -e SPRING_DATASOURCE_PASSWORD=... \
#                   -e APP_JWT_SECRET=... \
#                   -v uploads:/var/app/uploads \
#                   ebella
# =============================================================================


# -----------------------------------------------------------------------------
# Stage 1 — frontend build (Vite → dist/)
# Vite resolves VITE_* at build time; override these via --build-arg.
# -----------------------------------------------------------------------------
FROM node:20-alpine AS frontend-build
WORKDIR /frontend

ARG VITE_API_BASE_URL=/api/v1
ARG VITE_PUBLIC_SITE_URL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_PUBLIC_SITE_URL=$VITE_PUBLIC_SITE_URL

COPY frontend/package*.json ./
RUN npm ci --no-audit --no-fund

COPY frontend/ ./
RUN npm run build


# -----------------------------------------------------------------------------
# Stage 2 — backend build (Maven → furniture-catalog.jar)
# The frontend bundle is placed under the backend's static/ resource path so
# Spring Boot serves it from the classpath at /.
# -----------------------------------------------------------------------------
FROM maven:3.9-eclipse-temurin-21 AS backend-build
WORKDIR /backend

COPY backend/pom.xml ./
RUN mvn -B -q -e -DskipTests dependency:go-offline

COPY backend/src ./src

# Drop the built SPA into the jar's static/ path (WebConfig's SPA fallback
# serves it at / with index.html for deep links).
COPY --from=frontend-build /frontend/dist /backend/src/main/resources/static

RUN mvn -B -q -e -DskipTests package \
 && mv target/furniture-catalog.jar /backend/app.jar


# -----------------------------------------------------------------------------
# Stage 3 — runtime
# -----------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine AS runtime

# curl for HEALTHCHECK; tini as PID 1.
RUN apk add --no-cache curl tini \
 && addgroup -S app && adduser -S app -G app -h /app

WORKDIR /app
COPY --from=backend-build --chown=app:app /backend/app.jar /app/app.jar

# Default upload root; mount a volume to persist across restarts.
RUN mkdir -p /var/app/uploads && chown -R app:app /var/app/uploads
ENV APP_STORAGE_LOCAL_ROOT=/var/app/uploads

# Container-aware JVM ergonomics.
ENV JAVA_OPTS="-XX:+UseZGC -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError"
ENV SPRING_PROFILES_ACTIVE=prod
ENV SERVER_PORT=8080
EXPOSE 8080

USER app
ENTRYPOINT ["/sbin/tini","--","sh","-c","exec java $JAVA_OPTS -jar /app/app.jar"]

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -fsS "http://127.0.0.1:${SERVER_PORT}/actuator/health" || exit 1
