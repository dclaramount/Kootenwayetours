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
# and generated) — force the correct engine below instead of trusting that
# detection. See binaryTargets in prisma/schema.prisma. The exact filename
# depends on CPU architecture (arm64 vs amd64), which build host and
# deploy target don't always match (e.g. building locally on Apple Silicon
# vs. CI's amd64 runners vs. the amd64 Civo node) — resolved at container
# start via docker-entrypoint.sh instead of hardcoded here, so the same
# image works correctly regardless of which architecture built or is
# running it.
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY infra/docker/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "server.js"]
