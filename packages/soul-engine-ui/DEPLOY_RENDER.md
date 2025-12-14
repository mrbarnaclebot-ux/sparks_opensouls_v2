# Deploy SPARK Terminal to Render (Without Docker)

## Prerequisites

- A Render account (https://render.com)
- Your repo pushed to GitHub/GitLab
- OpenAI API key

## Quick Deploy with Blueprint

1. **Push to GitHub:**

   ```bash
   git add render.yaml
   git commit -m "Add Render deployment configuration"
   git push
   ```

2. **Deploy on Render:**

   - Go to https://dashboard.render.com
   - Click **"New +"** → **"Blueprint"**
   - Connect your GitHub repository
   - Render will detect `render.yaml` in the root
   - Review and click **"Apply"**

3. **Set Environment Variables:**
   After creation, go to each service's Environment tab:

   **For soul-engine-cloud:**
   | Variable | Value |
   |----------|-------|
   | `OPENAI_API_KEY` | `sk-your-openai-api-key` |

   **For spark-terminal-ui:**
   | Variable | Value |
   |----------|-------|
   | `NEXT_PUBLIC_HOCUS_POCUS_HOST` | `wss://soul-engine-cloud.onrender.com` |

## Services Deployed

### 1. soul-engine-cloud (Backend)

- **Runtime**: Node.js with Bun
- **Port**: 4000
- **Plan**: Starter ($7/month) - required for always-on WebSocket connections

### 2. spark-terminal-ui (Frontend)

- **Runtime**: Node.js/Next.js
- **Plan**: Free

## After Deployment

1. Wait for both services to deploy (5-10 minutes)
2. Get the backend URL from Render dashboard (e.g., `soul-engine-cloud.onrender.com`)
3. Set `NEXT_PUBLIC_HOCUS_POCUS_HOST` in the UI service to `wss://[backend-url]`
4. Access your SPARK Terminal at: `https://spark-terminal-ui.onrender.com/spark`

## Important: Start the SPARK Soul

The SPARK soul needs to be running and connected to the backend. You can either:

### Option A: Run soul locally connecting to deployed backend

```bash
cd souls/SPARK
SOUL_ENGINE_URL=wss://soul-engine-cloud.onrender.com bunx soul-engine dev
```

### Option B: Deploy soul as a separate service

Add another service in render.yaml for running the soul continuously.

## Troubleshooting

### Backend fails to start

- Check that `OPENAI_API_KEY` is set correctly
- Ensure the plan is "Starter" or higher (Free plan sleeps and breaks WebSocket)

### UI can't connect to backend

- Verify `NEXT_PUBLIC_HOCUS_POCUS_HOST` uses `wss://` protocol
- Check the backend URL is correct (no trailing slash)

### Build fails with TypeScript errors

- The workspace packages need to be built first
- Check the build command builds packages in order: core → engine → soul → react → soul-engine-ui

## Costs

- **soul-engine-cloud**: ~$7/month (Starter plan required for persistent WebSocket)
- **spark-terminal-ui**: Free
- **OpenAI API**: Pay-per-use (~$0.01-0.03 per conversation turn with GPT-4)
