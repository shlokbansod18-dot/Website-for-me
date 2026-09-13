# syntax=docker/dockerfile:1

# ─────────────────────────────────────────────────────────────────────────
#  softsystem
#
#  Runs on anything that takes a container — Railway, Fly.io, Render, Coolify,
#  or a plain VPS. Mount a persistent volume at /data: the SQLite database and
#  every uploaded product file live there, and a container filesystem is wiped
#  on each deploy.
#
#  Build:  docker build -t softsystem .
#  Run:    docker run -p 3000:3000 -v softsystem-data:/data \
#            -e SESSION_SECRET=… -e ENCRYPTION_KEY=… -e APP_URL=https://… \
#            softsystem
# ─────────────────────────────────────────────────────────────────────────

FROM node:22-bookworm-slim AS deps
WORKDIR /app
# better-sqlite3 ships prebuilt binaries for this platform, but keep a
# toolchain here so the build still succeeds if a prebuild is ever missing.
# This stage is discarded; none of it reaches the final image.
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
 && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund


FROM node:22-bookworm-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# No secrets are passed in: the build does not need them, and anything set
# here would be recoverable from the image layers afterwards.
RUN npm run build


FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATA_DIR=/data

# Run as a normal user. Nothing here needs root, and the upload directory
# should not be writable by a process that could otherwise touch the system.
RUN groupadd --system --gid 1001 softsystem \
 && useradd --system --uid 1001 --gid softsystem softsystem \
 && mkdir -p /data/uploads \
 && chown -R softsystem:softsystem /data \
 && chmod 700 /data

COPY --from=builder --chown=softsystem:softsystem /app/public ./public
# The standalone bundle is a complete server with only the modules it needs
# traced in, including better-sqlite3's compiled binding.
COPY --from=builder --chown=softsystem:softsystem /app/.next/standalone ./
COPY --from=builder --chown=softsystem:softsystem /app/.next/static ./.next/static

USER softsystem
EXPOSE 3000
VOLUME ["/data"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
