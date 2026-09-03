# Multi-stage build for the Kootenwaye Tours monolith (Next.js + Prisma).
# Build from the repo root: docker build -f infra/docker/Dockerfile -t kootenwayetours .

FROM node:24-alpine AS deps
WORKDIR /app
# openssl: Prisma's query engine needs libssl, which isn't in the base image.
# prisma/: `npm ci` runs our postinstall (`prisma generate`), which needs the schema present.
RUN apk add --no-cache openssl
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci

FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
# Prisma's own OpenSSL auto-detection is unreliable on Alpine/musl (it
# repeatedly picks the openssl-1.1.x engine even with openssl 3.x installed
# and generated) — force the exact engine we know is correct instead of
# trusting that detection. See binaryTargets in prisma/schema.prisma.
ENV PRISMA_QUERY_ENGINE_LIBRARY=/app/node_modules/.prisma/client/libquery_engine-linux-musl-arm64-openssl-3.0.x.so.node
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PRISMA_QUERY_ENGINE_LIBRARY=/app/node_modules/.prisma/client/libquery_engine-linux-musl-arm64-openssl-3.0.x.so.node
RUN apk add --no-cache openssl
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
