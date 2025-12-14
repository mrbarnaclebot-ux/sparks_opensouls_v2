# SPARK Terminal - Local Setup Guide

This guide will help you run the SPARK Terminal locally for development.

## Prerequisites

- [Bun](https://bun.sh/docs/installation) - Runtime and package manager
- [Docker Desktop](https://docs.docker.com/desktop/) - For Supabase (optional for basic local development)
- Git

## Quick Start

### 1. Clone and Setup Repository

```bash
git clone https://github.com/mrbarnaclebot-ux/sparks_opensouls_v2.git
cd sparks_opensouls_v2
```

### 2. Start the Soul Engine Backend

The Soul Engine backend runs the AI processing and websocket connections.

```bash
cd packages/soul-engine-cloud
bun install
bun run dev
```

You should see output like:

```
info: server starting {"port":4000}
info: listening on port
info: worker pool launched
```

**Keep this terminal running.**

### 3. Start the UI Server

In a **new terminal window**, start the Next.js UI server:

```bash
cd packages/soul-engine-ui
bun install
bun run dev
```

You should see:

```
▲ Next.js 14.2.3
- Local:        http://localhost:3000
✓ Ready in 2.1s
```

**Keep this terminal running.**

### 4. Access the SPARK Terminal

Open your browser and navigate to:

```
http://localhost:3000/spark
```

You should see:

- SPARK_TERMINAL v1.0.0 header
- Green "ONLINE" status indicator
- Chat interface with SPARK (the AI companion)
- A friendly dog mascot
- Message input at the bottom

## Environment Configuration

### Soul Engine Cloud (.env)

The `packages/soul-engine-cloud/.env` file contains backend configuration. Check `.env.example` for required values.

### Soul Engine UI (.env.local)

The `packages/soul-engine-ui/.env.local` file contains frontend configuration. Check `.env.example` for required values.

## Troubleshooting

### Port Already in Use

If port 3000 or 4000 is already in use:

- **UI (3000)**: Stop any other Next.js/React dev servers
- **Backend (4000)**: Stop any other Soul Engine instances

### Connection Issues

If the SPARK terminal shows "OFFLINE" or connection errors:

1. Verify the backend is running on port 4000
2. Check browser console for WebSocket errors
3. Ensure both servers started without errors

### Database Issues

The backend uses PGlite (embedded PostgreSQL) for local development. If you see database errors:

1. Delete the `packages/soul-engine-cloud/data/pglite` directory
2. Restart the backend server

## Advanced: Using Supabase (Optional)

For full database features:

```bash
cd packages/soul-engine-cloud
bunx supabase start
bunx supabase db reset
bun run dev
```

After logging in, add your username to `allowed_github_usernames` table at:
http://localhost:54323/project/default/editor

## Architecture

- **Backend** (`soul-engine-cloud`): Bun + Hono server, handles AI processing, WebSocket connections, worker pools
- **Frontend** (`soul-engine-ui`): Next.js 14, React UI for the SPARK terminal
- **Port 4000**: Backend API and WebSocket server
- **Port 3999**: Internal worker WebSocket connections
- **Port 3000**: Frontend development server

## Default Configuration

When accessing `/spark` without query parameters, it uses:

- `org=local` - Organization slug for local development
- `soul=SPARK` - The SPARK subroutine/soul
- `chat=spark-terminal` - Chat session ID

## Next Steps

- Explore the `souls/SPARK/` directory for SPARK's personality and behavior
- Modify chat UI in `packages/soul-engine-ui/src/components/SparkChat.tsx`
- Check `packages/soul-engine-ui/src/app/spark/page.tsx` for routing

## Support

For issues or questions, check the main repository README.md or create an issue on GitHub.

---

**Working as of commit:** `79b11f9` (working chat)
