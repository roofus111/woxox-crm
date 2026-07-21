# syntax=docker/dockerfile:1
# WOXOX CRM — Next.js frontend (production)

FROM node:20-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json* ./
COPY src/prisma ./src/prisma
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
RUN npm ci --ignore-scripts

FROM node:20-bookworm-slim AS build
WORKDIR /app
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_CRM_PLATFORM_API_URL
ARG NEXT_PUBLIC_USE_CRM_PLATFORM_DASHBOARD=true
ARG NEXT_PUBLIC_SOCKET_URL
ARG NEXT_PUBLIC_LEGALOS_API_URL
ARG NEXT_PUBLIC_LEGALOS_WEB_URL
ARG NEXTAUTH_URL
ARG NEXTAUTH_SECRET

ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_CRM_PLATFORM_API_URL=$NEXT_PUBLIC_CRM_PLATFORM_API_URL
ENV NEXT_PUBLIC_USE_CRM_PLATFORM_DASHBOARD=$NEXT_PUBLIC_USE_CRM_PLATFORM_DASHBOARD
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL
ENV NEXT_PUBLIC_LEGALOS_API_URL=$NEXT_PUBLIC_LEGALOS_API_URL
ENV NEXT_PUBLIC_LEGALOS_WEB_URL=$NEXT_PUBLIC_LEGALOS_WEB_URL
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
ENV NEXT_TELEMETRY_DISABLED=1

RUN npx prisma generate && npm run build:icons
RUN npm run build
RUN if [ ! -f .next/BUILD_ID ]; then \
      echo "ERROR: .next/BUILD_ID missing after next build"; \
      echo "Listing /app:"; ls -la /app; \
      echo "Listing .next (if any):"; ls -la /app/.next || true; \
      find /app -name BUILD_ID 2>/dev/null || true; \
      exit 1; \
    fi \
    && echo "Next.js production build OK: $(cat .next/BUILD_ID)" \
    && ls -la .next

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.mjs ./next.config.mjs
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next

# Confirm build files made it into the final image
RUN test -f .next/BUILD_ID && echo "Runner image has BUILD_ID=$(cat .next/BUILD_ID)"

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:3000').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "node_modules/next/dist/bin/next", "start", "-H", "0.0.0.0", "-p", "3000"]
