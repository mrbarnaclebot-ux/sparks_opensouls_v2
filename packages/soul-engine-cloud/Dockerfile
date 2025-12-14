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

# Generate Prisma client
WORKDIR /monorepo/packages/soul-engine-cloud
RUN bun run prisma:generate

# Production stage - Keep monorepo structure for workspace dependencies
FROM base AS runner
WORKDIR /monorepo

# Create data directories for persistent storage
RUN mkdir -p /monorepo/packages/soul-engine-cloud/data/pglite /monorepo/packages/soul-engine-cloud/data/code

# Copy entire monorepo structure (needed for workspace deps)
COPY --from=builder /monorepo/node_modules ./node_modules
COPY --from=builder /monorepo/package.json ./package.json
COPY --from=builder /monorepo/packages/core ./packages/core
COPY --from=builder /monorepo/packages/engine ./packages/engine
COPY --from=builder /monorepo/packages/soul ./packages/soul
COPY --from=builder /monorepo/packages/pipeline ./packages/pipeline
COPY --from=builder /monorepo/packages/soul-engine-cloud ./packages/soul-engine-cloud

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000
ENV CODE_PATH=/monorepo/packages/soul-engine-cloud/data/code
ENV PGLITE_DATA_DIR=/monorepo/packages/soul-engine-cloud/data/pglite

WORKDIR /monorepo/packages/soul-engine-cloud

EXPOSE 4000

# Start the server
CMD ["bun", "run", "./scripts/run-server.ts"]
