# Use official Bun image
FROM oven/bun:1.3 AS base
WORKDIR /monorepo

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

# Build the UI from monorepo root (Next.js needs workspace packages)
WORKDIR /monorepo/packages/soul-engine-ui
RUN bun run build

# Production stage - Keep monorepo structure for workspace dependencies
FROM base AS runner
WORKDIR /monorepo

ENV NODE_ENV=production
ENV PORT=3000

# Copy entire monorepo structure (Next.js needs workspace deps at runtime)
COPY --from=builder /monorepo/node_modules ./node_modules
COPY --from=builder /monorepo/package.json ./package.json
COPY --from=builder /monorepo/packages/core ./packages/core
COPY --from=builder /monorepo/packages/engine ./packages/engine
COPY --from=builder /monorepo/packages/soul ./packages/soul
COPY --from=builder /monorepo/packages/react ./packages/react
COPY --from=builder /monorepo/packages/soul-engine-ui/.next ./packages/soul-engine-ui/.next
COPY --from=builder /monorepo/packages/soul-engine-ui/public ./packages/soul-engine-ui/public
COPY --from=builder /monorepo/packages/soul-engine-ui/package.json ./packages/soul-engine-ui/package.json
COPY --from=builder /monorepo/packages/soul-engine-ui/next.config.mjs ./packages/soul-engine-ui/next.config.mjs

WORKDIR /monorepo/packages/soul-engine-ui

EXPOSE 3000

CMD ["bun", "run", "start"]
