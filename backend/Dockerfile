# =============================================================================
# Stage 1 — build
# Cache Maven deps as a separate layer so source-only changes stay fast.
# =============================================================================
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace

COPY pom.xml ./
RUN mvn -B -q -e -DskipTests dependency:go-offline

COPY src ./src
RUN mvn -B -q -e -DskipTests package \
 && mv target/furniture-catalog.jar /workspace/app.jar

# =============================================================================
# Stage 2 — runtime
# =============================================================================
FROM eclipse-temurin:21-jre-alpine AS runtime

# Curl for healthcheck only — keeps the layer tiny.
RUN apk add --no-cache curl tini \
 && addgroup -S app && adduser -S app -G app -h /app

WORKDIR /app
COPY --from=build --chown=app:app /workspace/app.jar /app/app.jar

# Default upload root inside the container; mount a volume to persist.
RUN mkdir -p /var/app/uploads && chown -R app:app /var/app/uploads
ENV APP_STORAGE_LOCAL_ROOT=/var/app/uploads

# JVM defaults: container-aware ergonomics + low GC pause.
ENV JAVA_OPTS="-XX:+UseZGC -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError"
ENV SERVER_PORT=8080
EXPOSE 8080

USER app
ENTRYPOINT ["/sbin/tini","--","sh","-c","exec java $JAVA_OPTS -jar /app/app.jar"]

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -fsS "http://127.0.0.1:${SERVER_PORT}/actuator/health" || exit 1
