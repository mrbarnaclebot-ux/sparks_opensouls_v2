# Spark Terminal UI

A terminal-style chat interface for talking to Spark, the AI soul dog.

![Spark Terminal](./public/pixel-spark.png)

## Features

- 🖥️ Terminal-style UI with white background and black elements
- 🐕 Spark's pixel art avatar displayed above the chat
- 🟢 Real-time connection status (ONLINE/OFFLINE/ERROR)
- 💬 Chat with Spark using the Soul Engine
- 🔄 Reset button to clear chat history
- ⚠️ Error messages displayed as Spark speaking
- 📱 Responsive design for mobile and desktop

## Quick Start (Local Development)

### Prerequisites

- [Bun](https://bun.sh/) installed
- OpenAI API key

### Step 1: Set up the Spark Soul

```bash
# Install dependencies
bun install

# Create environment file with your OpenAI API key
bun run setup or echo "OPENAI_API_KEY=your-openai-api-key-here" > .env

# Navigate to the Spark soul directory
cd souls/SPARK


# Start the Soul Engine
bunx soul-engine dev
```

Keep this terminal running.

### Step 2: Start the UI

Open a new terminal:

```bash
# Navigate to the UI directory
cd packages/soul-engine-ui && bun run dev

```

### Step 3: Open in Browser

Visit **http://localhost:3000** to chat with Spark!

## Configuration

Copy `.env.example` to `.env.local` and configure:

```bash
# WebSocket URL for Soul Engine backend
NEXT_PUBLIC_HOCUS_POCUS_HOST=ws://localhost:4000

# Organization slug (use "local" for local development)
NEXT_PUBLIC_ORGANIZATION_SLUG=local

# Soul subroutine ID
NEXT_PUBLIC_SUBROUTINE_ID=SPARK
```

## Project Structure

```
packages/soul-engine-ui/
├── public/
│   ├── pixel-spark.png    # Spark's main avatar
│   └── spark-icon.png     # Chat message avatar
├── src/
│   └── app/
│       ├── page.tsx       # Main terminal UI component
│       ├── globals.css    # Terminal styling
│       └── layout.tsx     # App layout
└── .env.example           # Environment configuration template
```

## Deployment

### Vercel

1. Push to GitHub
2. Import project to Vercel
3. Set root directory to `packages/soul-engine-ui`
4. Add environment variables:
   - `NEXT_PUBLIC_HOCUS_POCUS_HOST=wss://your-backend-url`
   - `NEXT_PUBLIC_ORGANIZATION_SLUG=your-org`
   - `NEXT_PUBLIC_SUBROUTINE_ID=SPARK`

### Other Platforms

```bash
bun run build
bun run start
```

## Troubleshooting

### "Spark says he's offline"

- Make sure the Soul Engine is running (`bunx soul-engine dev` in `souls/SPARK`)

### "API key error"

- Create `souls/SPARK/.env` with your `OPENAI_API_KEY`

### "Connection error"

- Check that both terminals are running
- Verify the WebSocket URL in `.env.local`

## Soul Engine Documentation

For more information about creating AI souls, visit [docs.souls.chat](https://docs.souls.chat/)
