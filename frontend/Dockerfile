# =============================================================================
# Stage 1 — build
# Vite resolves VITE_* vars at build time, so they come in as ARGs.
# =============================================================================
FROM node:20-alpine AS build
WORKDIR /workspace

ARG VITE_API_BASE_URL=/api/v1
ARG VITE_PUBLIC_SITE_URL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_PUBLIC_SITE_URL=$VITE_PUBLIC_SITE_URL

# Cache npm install
COPY package*.json ./
# `npm install` works with or without a committed package-lock.json.
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run build

# =============================================================================
# Stage 2 — runtime (nginx serving the SPA + reverse-proxying API/media)
# =============================================================================
FROM nginx:1.27-alpine AS runtime

RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/*
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz || exit 1
