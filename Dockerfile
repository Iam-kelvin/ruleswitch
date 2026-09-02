FROM node:22-alpine AS build

WORKDIR /app
ENV CI=1 \
    EXPO_NO_TELEMETRY=1 \
    NODE_OPTIONS=--max-old-space-size=1536

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

ARG EXPO_PUBLIC_POSTHOG_KEY=""
ARG EXPO_PUBLIC_POSTHOG_HOST="https://us.i.posthog.com"
ARG EXPO_PUBLIC_SENTRY_DSN=""
ENV EXPO_PUBLIC_POSTHOG_KEY=${EXPO_PUBLIC_POSTHOG_KEY} \
    EXPO_PUBLIC_POSTHOG_HOST=${EXPO_PUBLIC_POSTHOG_HOST} \
    EXPO_PUBLIC_SENTRY_DSN=${EXPO_PUBLIC_SENTRY_DSN}

RUN npm run build:web

FROM nginx:1.28-alpine

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
