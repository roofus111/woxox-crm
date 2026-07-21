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
# Fail the image build if production output is missing (prevents runtime 502)
RUN test -f .next/BUILD_ID \
  && test -d .next/standalone \
  && test -d .next/static \
  && echo "Next.js production build OK: $(cat .next/BUILD_ID)"

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

# Standalone server (includes minimal node_modules + server.js)
COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:3000').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
