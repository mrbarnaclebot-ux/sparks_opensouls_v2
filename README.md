# Soul Engine - Local AI Agent Framework

**Historical Research Snapshot**: This is a snapshot of the Soul Engine from roughly 2-3 years ago, simplified for local development. Authentication and cloud features have been removed to enable fully local operation. This codebase contains interesting cognitive architecture explorations but should be considered research code, not production-ready software.

## What is the Soul Engine?

The Soul Engine provides a framework for creating AI agents ("souls") with personality, memory, and dynamic behavior. It uses two core abstractions:

- **WorkingMemory**: Immutable collection of memories that represent the agent's current state
- **CognitiveSteps**: Functions that transform WorkingMemory and return typed responses
- **MentalProcesses**: State machines that orchestrate agent behavior across different modes

The functional, append-only approach makes AI thought processes debuggable and predictable. Agents can have persistent memory, dynamic personality, and complex behavioral patterns.

## Prerequisites

1. **Bun Runtime** - Install from [bun.sh](https://bun.sh)

   ```bash
   # On Windows (PowerShell)
   powershell -c "irm bun.sh/install.ps1 | iex"

   # On macOS/Linux
   curl -fsSL https://bun.sh/install | bash
   ```

2. **OpenAI API Key** - Get one from [platform.openai.com](https://platform.openai.com/api-keys)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
bun install
```

This installs all required packages for the Soul Engine services.

### 2. Configure Environment

```bash
bun run setup
```

This will:

- Prompt for your OpenAI API key
- Generate the Prisma database client
- Create necessary environment files

### 3. Start the Soul Engine Services

```bash
bun start
```

This starts three services concurrently:

- **Soul Engine Cloud** (Backend API) - `http://localhost:4000`
- **Soul Engine UI** (Web Interface) - `http://localhost:3002`
- **Documentation Server** - `http://localhost:3003`

Wait for all services to show "Ready" status before proceeding.

## Running Your First Soul

### Simple Samantha Example

```bash
# In a new terminal (keep the services running)
cd souls/examples/simple-samantha
bunx soul-engine dev
```

This will:

1. Load the Samantha soul configuration
2. Start a development server
3. Open your browser to the chat interface

**Chat URL**: The terminal will show a URL like:
`http://localhost:3002/chats/local/simple-samantha/[unique-id]`

### Try Other Examples

```bash
# Samantha with learning capabilities
cd souls/examples/samantha-learns && bunx soul-engine dev

# Hugo plays 20 questions about musicians
cd souls/examples/hugo-guesses-rockstars && bunx soul-engine dev
```

## Creating Your Own Soul

```bash
# Create a new soul template
cd souls
bunx soul-engine init my-soul-name
cd my-soul-name

# Start developing
bunx soul-engine dev
```

Edit the soul files to customize personality and behavior:

- `soul/staticMemories/core.md` - Core personality and memories
- `soul/cognitiveSteps/` - Custom thought processes
- `soul/subprocesses/` - Background tasks

## Service Ports

| Service           | Port | Purpose                               |
| ----------------- | ---- | ------------------------------------- |
| Soul Engine Cloud | 4000 | Backend API and WebSocket server      |
| Soul Engine UI    | 3002 | Web interface for chatting with souls |
| Documentation     | 3003 | API documentation and guides          |

## Troubleshooting

### Common Issues

**1. "Cannot find module './node'" OpenTelemetry Error**

```
Solution: This is a Bun compatibility issue. The instrumentation has been disabled for local development.
```

**2. Port Already in Use**

```
Error: listen EADDRINUSE: address already in use
Solution:
- Kill processes using the ports: netstat -ano | findstr :PORT
- Or restart your terminal/command prompt
- Services will automatically find available ports
```

**3. OpenAI API Model Not Found (404)**

```
Error: 404 The model "SOME_MODEL" does not exist
Solutions:
- Check your API key in packages/soul-engine-cloud/.env
- Update to a current model like "gpt-4" or "gpt-3.5-turbo"
- Verify your OpenAI account has access to the requested model
```

**4. Documentation Server Won't Start**

```
Error: Failed to start server EADDRINUSE
Solution: The docs server runs on port 3003. Kill any process using that port.
```

**5. Soul Won't Load**

```
Error: Cannot find soul configuration
Solution:
- Ensure you're in the correct directory (souls/examples/[soul-name])
- Check that package.json exists in the soul directory
- Try running: bunx soul-engine dev from the soul's root directory
```

**6. Windows Command Issues**

```
Error: 'PORT' is not recognized
Solution: The setup scripts now use cross-platform commands. Restart your terminal if issues persist.
```

**7. Database Connection Issues**

```
Error: PGlite bootstrap failed
Solution: Delete the packages/soul-engine-cloud/data/ directory and restart the cloud service.
```

### Checking Service Status

```bash
# Check if services are running
netstat -ano | findstr "4000\|3002\|3003"
```

### Resetting Everything

If you encounter persistent issues:

```bash
# Stop all services (Ctrl+C in each terminal)

# Clean data
rm -rf packages/soul-engine-cloud/data/

# Reinstall dependencies
rm -rf node_modules bun.lockb
bun install

# Reconfigure
bun run setup

# Restart services
bun start
```

## Development Notes

- **Hot Reload**: Soul changes take effect immediately when saved
- **Local Mode**: Authentication is disabled - everything runs locally
- **Persistence**: Conversations and soul state are saved locally
- **Models**: Supports OpenAI GPT models (configure in soul settings)

## Architecture Overview

```
├── packages/soul-engine-cloud/    # Backend API server
├── packages/soul-engine-ui/       # Next.js web interface
├── packages/beta-docs/           # Documentation site
├── souls/                        # Soul configurations
│   ├── examples/                 # Pre-built soul examples
│   └── [your-soul]/             # Custom souls
└── library/                      # Shared utilities
```

## API Documentation

Visit `http://localhost:3003` when services are running for comprehensive API documentation covering:

- WorkingMemory API
- CognitiveSteps
- MentalProcesses
- Hooks and integrations

## Contributing

This is a research snapshot. For questions or contributions, refer to the documentation or explore the codebase structure.

---

**🎉 Success!** You now have a fully functional AI agent framework running locally. Start by chatting with Samantha, then explore creating your own souls with unique personalities and capabilities.
