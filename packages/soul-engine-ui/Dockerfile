# Use official Bun image
FROM oven/bun:1.3 AS base
WORKDIR /app

# Install dependencies for monorepo
FROM base AS deps
WORKDIR /monorepo

# Copy root package files
COPY package.json bun.lockb ./

# Copy workspace package.json files
COPY packages/soul-engine-ui/package.json ./packages/soul-engine-ui/
COPY packages/core/package.json ./packages/core/
COPY packages/engine/package.json ./packages/engine/
COPY packages/react/package.json ./packages/react/
COPY packages/soul/package.json ./packages/soul/
COPY packages/pipeline/package.json ./packages/pipeline/
COPY packages/cli/package.json ./packages/cli/

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

WORKDIR /monorepo/packages/react
RUN bun run build || true

# Build the UI
WORKDIR /monorepo/packages/soul-engine-ui
RUN bun run build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy built application
COPY --from=builder /monorepo/packages/soul-engine-ui/.next ./.next
COPY --from=builder /monorepo/packages/soul-engine-ui/public ./public
COPY --from=builder /monorepo/packages/soul-engine-ui/package.json ./
COPY --from=builder /monorepo/packages/soul-engine-ui/next.config.mjs ./
COPY --from=builder /monorepo/packages/soul-engine-ui/node_modules ./node_modules

EXPOSE 3000

CMD ["bun", "run", "start"]
