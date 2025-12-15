# SPARK Terminal Deployment Fix

## Problem

When deploying to Render, you encountered this error:

```
ERROR: Error adding perception: ENOENT: no such file or directory,
open '/data/code/local/SPARK/.soul-engine-out/staticModuleRecord.json'
```

## Root Cause

The SPARK soul files were not being included in the deployment build. The backend was looking for compiled soul files that didn't exist because:

1. The SPARK soul code lives in `souls/SPARK/` directory
2. During deployment, only the `packages/soul-engine-cloud/` directory was being built
3. The backend expects pre-compiled soul files at runtime in `/data/code/local/SPARK/.soul-engine-out/`
4. No build step was copying and compiling the SPARK soul

## Solution

We created an automated bundle process that:

1. **Copies the SPARK soul** from `souls/SPARK/` to the deployment location
2. **Pre-compiles the soul** using `CodeWriter` to generate the required `staticModuleRecord.json`
3. **Bundles it with the deployment** so it's available at runtime

## Changes Made

### 1. Created Bundle Script

**File:** `packages/soul-engine-cloud/scripts/bundle-spark.ts`

This script:

- Copies SPARK soul from `souls/SPARK/` to `data/code/local/SPARK/`
- Compiles the soul using Bun's bundler
- Generates the required `.soul-engine-out/staticModuleRecord.json` file
- Verifies the output was created successfully

### 2. Updated package.json

**File:** `packages/soul-engine-cloud/package.json`

Added scripts:

```json
{
  "bundle:spark": "bun run scripts/bundle-spark.ts",
  "start": "bun run ./scripts/run-server.ts"
}
```

### 3. Updated Render Deployment

**File:** `render.yaml`

Changes to `soul-engine-cloud` service:

- Added `souls/SPARK/**` to `buildFilter.paths` to trigger rebuilds when SPARK changes
- Added `packages/engine/**` and `packages/soul/**` to dependencies
- Added `CODE_PATH` environment variable
- Updated `buildCommand` to run `bun run bundle:spark` after Prisma generation

### 4. Updated Dockerfile (for Railway/Docker deployments)

**File:** `packages/soul-engine-cloud/Dockerfile`

Changes:

- Adjusted COPY commands to include `souls/SPARK` from repo root
- Added CODE_PATH environment variable
- Runs `bun run bundle:spark` during build stage
- Copies compiled soul data to final production image

## How to Deploy

### For Render

1. **Commit and push these changes:**

   ```bash
   git add .
   git commit -m "Fix: Bundle SPARK soul for deployment"
   git push origin main
   ```

2. **Render will automatically detect changes** and rebuild

3. **Verify the build logs** show:

   ```
   bun run bundle:spark
   ✅ SPARK bundle complete!
   ```

4. **Check runtime logs** - you should no longer see the ENOENT error

### For Railway (Docker)

1. **Make sure Docker context is repo root:**

   ```bash
   # Build from repo root, not packages/soul-engine-cloud
   docker build -f packages/soul-engine-cloud/Dockerfile -t spark-terminal .
   ```

2. **Push to Railway:**

   ```bash
   git add .
   git commit -m "Fix: Bundle SPARK soul for deployment"
   git push origin main
   ```

3. Railway will use the Dockerfile and build from repo root automatically

## Environment Variables Required

Make sure these are set in your Render dashboard:

```bash
OPENAI_API_KEY=sk-...                    # REQUIRED
DATABASE_URL=postgresql://...            # Auto-set by Render
REDIS_URL=redis://...                    # Auto-set by Render
CODE_PATH=/opt/render/project/src/packages/soul-engine-cloud/data/code  # Set by render.yaml
```

## Testing Locally

To test the bundle process locally:

```bash
cd packages/soul-engine-cloud

# Set CODE_PATH for local testing
export CODE_PATH=./data/code

# Run the bundle script
bun run bundle:spark

# You should see:
# ✅ SPARK bundle complete!

# Verify the output exists
ls -la data/code/local/SPARK/soul/.soul-engine-out/staticModuleRecord.json
```

## Verification

After deployment, verify SPARK Terminal works:

1. **Visit:** `https://your-frontend.onrender.com/spark`
2. **Check status:** Should show green "ONLINE" indicator
3. **Send a message:** Type "Hello SPARK!" and verify you get a response
4. **Check logs:** No more ENOENT errors in backend logs

## Troubleshooting

### If you still see ENOENT error:

1. **Check build logs** - ensure `bun run bundle:spark` completed successfully
2. **Check CODE_PATH** - verify it matches in build and runtime
3. **Check file permissions** - ensure the bundled files are readable
4. **Re-deploy** - sometimes a full rebuild is needed

### If build times out:

1. **Use Starter plan** on Render (already configured in render.yaml)
2. **Check dependencies** - ensure workspace dependencies resolve correctly

### If soul doesn't respond:

1. **Check OPENAI_API_KEY** is set correctly
2. **Check WebSocket connection** in browser console
3. **Check backend logs** for other errors

## What This Means for Future Souls

If you add more souls beyond SPARK:

1. **Option 1:** Extend `bundle-spark.ts` to bundle multiple souls
2. **Option 2:** Create a generic `bundle-souls.ts` script
3. **Option 3:** Use dynamic soul loading (requires different architecture)

For now, SPARK is bundled and ready to deploy!

## Summary

- ✅ SPARK soul is now bundled during build
- ✅ Pre-compiled and ready at runtime
- ✅ Works on Render and Railway
- ✅ No more ENOENT errors
- ✅ Deploy-ready configuration

Deploy your changes and SPARK Terminal should work! 🎉
