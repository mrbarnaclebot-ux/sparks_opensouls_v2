# SPARK - AI Dog Soul

SPARK is an AI dog soul that explores quantum portals and has playful conversations. Built on the Open Souls engine, SPARK demonstrates conversational AI with personality.

## Prerequisites

- [Bun](https://bun.sh/) runtime (v1.2+)
- OpenAI API key

## Quick Start

### Step 1: Install Dependencies

From the repository root, install all dependencies:

```bash
bun install
```

### Step 2: Generate Prisma Client

```bash
cd packages/soul-engine-cloud
bun run prisma:generate
```

### Step 3: Set Up Environment Variables

Create a `.env` file in `packages/soul-engine-cloud/` with your OpenAI API key:

```bash
# packages/soul-engine-cloud/.env
OPENAI_API_KEY=your-openai-api-key
```

### Step 4: Start the Soul Engine Cloud (Terminal 1)

```bash
cd packages/soul-engine-cloud
bun dev
```

This starts the backend server on **port 4000**.

### Step 5: Start the Debug UI (Terminal 2)

```bash
cd packages/soul-engine-ui
bun dev
```

This starts the Next.js debug interface on **port 3000**.

### Step 6: Start SPARK (Terminal 3)

```bash
cd souls/SPARK
bun ../../packages/cli/bin/run.js dev
```

This watches your soul code and syncs it with the engine.

### Step 7: Open the Chat Interface

The terminal will output a URL like:

```
debug chat available at http://localhost:3000/chats/local/SPARK/<session-id>
```

Open this URL in your browser to start chatting with SPARK!

## Project Structure

```
souls/SPARK/
├── package.json              # Soul configuration
├── soul/
│   ├── soul.ts               # Soul definition and attributes
│   ├── initialProcess.ts     # Main conversation logic
│   ├── memoryIntegrator.ts   # Memory management
│   ├── cognitiveSteps/       # Thought processes
│   │   ├── externalDialog.ts # Generates responses
│   │   └── internalMonologue.ts
│   ├── subprocesses/         # Background processes
│   │   └── summarizeConversation.ts
│   └── staticMemories/       # Core personality
│       └── core.md
└── chat-icon/                # Soul avatar
```

## Customizing SPARK

### Personality

Edit `soul/staticMemories/core.md` to change SPARK's personality, backstory, and speaking style.

### Soul Attributes

Edit `soul/soul.ts` to modify the soul's name, entity type, and other attributes.

### Conversation Logic

Edit `soul/initialProcess.ts` to change how SPARK responds to messages.

## Troubleshooting

### "Have you run 'bunx soul-engine dev' yet?"

Make sure the soul-engine-cloud is running on port 4000.

### Connection Issues

1. Ensure all three servers are running
2. Check that port 4000 (engine) and 3000 (UI) are not in use
3. Verify your OpenAI API key is set correctly

### Reset Conversation

Click the "Reset" button in the debug UI to start a fresh conversation.
