#!/bin/sh
set -e

# Resolves which Prisma query engine binary to use based on the CPU
# architecture actually running this container, rather than hardcoding one
# at build time — the image can be built on one architecture (e.g. Apple
# Silicon locally) and run on another (e.g. amd64 in the cluster), and
# Prisma's own OpenSSL auto-detection on Alpine/musl is unreliable (see the
# comment in infra/docker/Dockerfile). Requires prisma/schema.prisma's
# binaryTargets to include both "native" and "linux-musl-openssl-3.0.x" so
# whichever engine is needed has actually been generated.
case "$(uname -m)" in
  aarch64) ARCH_SUFFIX="-arm64" ;;
  x86_64) ARCH_SUFFIX="" ;;
  *)
    echo "docker-entrypoint.sh: unrecognized architecture '$(uname -m)', not setting PRISMA_QUERY_ENGINE_LIBRARY" >&2
    ARCH_SUFFIX=""
    ;;
esac

ENGINE_PATH="/app/node_modules/.prisma/client/libquery_engine-linux-musl${ARCH_SUFFIX}-openssl-3.0.x.so.node"

if [ -f "$ENGINE_PATH" ]; then
  export PRISMA_QUERY_ENGINE_LIBRARY="$ENGINE_PATH"
else
  echo "docker-entrypoint.sh: expected Prisma engine not found at $ENGINE_PATH — falling back to Prisma's own detection" >&2
fi

exec "$@"
