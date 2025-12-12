# Use official Bun image
FROM oven/bun:1.2 AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lockb ./
COPY frozen-npm ./frozen-npm
RUN bun install --frozen-lockfile

# Build stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run prisma:generate
RUN bun run build

# Production stage
FROM base AS runner
WORKDIR /app

# Create data directories for persistent storage
RUN mkdir -p /app/data/pglite /app/data/code

# Copy built application
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/frozen-npm ./frozen-npm
COPY --from=builder /app/data ./data
COPY --from=builder /app/soul-engine-bundle ./soul-engine-bundle

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000
ENV CODE_PATH=/app/data/code
ENV PGLITE_DATA_DIR=/app/data/pglite

EXPOSE 4000

# Start the server
CMD ["bun", "run", "./scripts/run-server.ts"]
