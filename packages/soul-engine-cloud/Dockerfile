# Use official Bun image
FROM oven/bun:1.3 AS base
WORKDIR /monorepo

# Install dependencies for monorepo
FROM base AS deps
WORKDIR /monorepo

# Copy root package files
COPY package.json bun.lockb ./

# Copy workspace package.json files for dependency resolution
COPY packages/soul-engine-cloud/package.json ./packages/soul-engine-cloud/
COPY packages/soul-engine-cloud/frozen-npm ./packages/soul-engine-cloud/frozen-npm
COPY packages/core/package.json ./packages/core/
COPY packages/engine/package.json ./packages/engine/
COPY packages/soul/package.json ./packages/soul/
COPY packages/pipeline/package.json ./packages/pipeline/
COPY packages/cli/package.json ./packages/cli/
COPY packages/react/package.json ./packages/react/

# Install all dependencies
RUN bun install

# Build stage
FROM base AS builder
WORKDIR /monorepo

COPY --from=deps /monorepo/node_modules ./node_modules
COPY . .

# Build workspace dependencies first
WORKDIR /monorepo/packages/core
RUN bun run build || true

WORKDIR /monorepo/packages/engine
RUN bun run build || true

WORKDIR /monorepo/packages/soul
RUN bun run build || true

WORKDIR /monorepo/packages/pipeline
RUN bun run build || true

# Build soul-engine-cloud
WORKDIR /monorepo/packages/soul-engine-cloud
RUN bun run prisma:generate
RUN bun run build

# Production stage
FROM base AS runner
WORKDIR /app

# Create data directories for persistent storage
RUN mkdir -p /app/data/pglite /app/data/code

# Copy built application from monorepo
COPY --from=builder /monorepo/packages/soul-engine-cloud/node_modules ./node_modules
COPY --from=builder /monorepo/packages/soul-engine-cloud/dist ./dist
COPY --from=builder /monorepo/packages/soul-engine-cloud/prisma ./prisma
COPY --from=builder /monorepo/packages/soul-engine-cloud/package.json ./
COPY --from=builder /monorepo/packages/soul-engine-cloud/scripts ./scripts
COPY --from=builder /monorepo/packages/soul-engine-cloud/frozen-npm ./frozen-npm
COPY --from=builder /monorepo/packages/soul-engine-cloud/data ./data
COPY --from=builder /monorepo/packages/soul-engine-cloud/soul-engine-bundle ./soul-engine-bundle

# Copy workspace dependencies that are needed at runtime
COPY --from=builder /monorepo/node_modules/@opensouls ./node_modules/@opensouls

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000
ENV CODE_PATH=/app/data/code
ENV PGLITE_DATA_DIR=/app/data/pglite

EXPOSE 4000

# Start the server
CMD ["bun", "run", "./scripts/run-server.ts"]
