# Deploy SPARK Terminal UI to Render (Without Docker)

## Prerequisites

- A Render account (https://render.com)
- Your repo pushed to GitHub/GitLab

## Option 1: Manual Deployment (Recommended)

### Step 1: Create a New Web Service on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:

| Setting            | Value                     |
| ------------------ | ------------------------- |
| **Name**           | `spark-terminal-ui`       |
| **Region**         | Oregon (or closest)       |
| **Branch**         | `main`                    |
| **Root Directory** | `packages/soul-engine-ui` |
| **Runtime**        | `Node`                    |
| **Build Command**  | See below                 |
| **Start Command**  | `npm run start`           |
| **Plan**           | Free                      |

### Build Command (copy this):

```bash
npm install -g bun && cd ../.. && bun install && cd packages/soul-engine-ui && bun run build
```

### Step 2: Set Environment Variables

In the Render dashboard, add these environment variables:

| Variable                        | Value                                         |
| ------------------------------- | --------------------------------------------- |
| `NODE_ENV`                      | `production`                                  |
| `NEXT_PUBLIC_HOCUS_POCUS_HOST`  | `wss://your-soul-engine-backend.onrender.com` |
| `NEXT_PUBLIC_ORGANIZATION_SLUG` | `local`                                       |
| `NEXT_PUBLIC_SUBROUTINE_ID`     | `SPARK`                                       |

⚠️ **Important**: Replace `your-soul-engine-backend.onrender.com` with your actual soul-engine-cloud backend URL.

### Step 3: Deploy

Click **"Create Web Service"** and wait for the build to complete.

## Option 2: Blueprint Deployment

1. In Render dashboard, click **"New +"** → **"Blueprint"**
2. Connect your repository
3. Render will detect the `render.yaml` file in `packages/soul-engine-ui/`
4. Review and deploy

## Accessing Your Deployed App

After deployment, your SPARK Terminal UI will be available at:

```
https://spark-terminal-ui.onrender.com/spark
```

## Deploying the Soul Engine Backend

You'll also need to deploy the `soul-engine-cloud` backend separately. It requires:

- PostgreSQL database
- Redis instance
- Environment variables for API keys

The backend is more complex and may require the Docker deployment option on Render.

## Troubleshooting

### Build Fails with "workspace:\*" errors

The monorepo workspace dependencies need the full repo to build. Make sure:

- Root Directory is set to `packages/soul-engine-ui`
- Build command starts from root: `cd ../..`

### WebSocket Connection Fails

- Ensure `NEXT_PUBLIC_HOCUS_POCUS_HOST` uses `wss://` (not `ws://`) for production
- Verify your backend is deployed and accessible

### Static Files Not Loading

Check that the build completed successfully and `next build` generated the `.next` folder.
