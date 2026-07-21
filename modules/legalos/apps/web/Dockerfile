# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
RUN npm install
COPY apps/web ./apps/web
COPY packages/shared ./packages/shared
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_LEGALOS_BEARER_TOKEN
ARG NEXT_PUBLIC_WORKSPACE_ID
ARG NEXT_PUBLIC_ALLOW_MOCKS=false
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_LEGALOS_BEARER_TOKEN=$NEXT_PUBLIC_LEGALOS_BEARER_TOKEN
ENV NEXT_PUBLIC_WORKSPACE_ID=$NEXT_PUBLIC_WORKSPACE_ID
ENV NEXT_PUBLIC_ALLOW_MOCKS=$NEXT_PUBLIC_ALLOW_MOCKS
RUN npm run build -w @woxox/legalos-web

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
RUN useradd --system --uid 1001 nextjs
COPY --from=build /app/apps/web/public ./apps/web/public
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
