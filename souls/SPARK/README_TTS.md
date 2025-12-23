# SPARK Text-to-Speech Quick Start

SPARK now speaks with a voice using ElevenLabs! 🗣️

## What Was Added

Three files have been created/modified:

1. **`soul/lib/tts.ts`** - TTS utility functions
2. **`soul/initialProcess.ts`** - Updated to use TTS
3. **`TTS_INTEGRATION.md`** - Full documentation

## How It Works

When SPARK responds to users, it now:

1. Generates text response (as before)
2. Automatically converts text to speech using your ElevenLabs voice
3. Dispatches both text and audio to the client

## Your Voice Configuration

- **Voice ID**: `82QdbKjAV5CMGd9tIUCB`
- **Model**: `eleven_monolingual_v1`
- **Settings**: Balanced stability and similarity

## Quick Test

To test the integration:

```bash
cd souls/SPARK
bun run @opensouls/cli dev
```

Then send a message to SPARK - you should receive both text and audio responses.

## Customizing Voice Settings

Edit `soul/lib/tts.ts` to adjust:

```typescript
export const SPARK_VOICE_CONFIG = {
  voiceId: '82QdbKjAV5CMGd9tIUCB',
  modelId: 'eleven_monolingual_v1', // or "eleven_multilingual_v2"
  stability: 0.5, // 0.0-1.0 (higher = more consistent)
  similarityBoost: 0.75, // 0.0-1.0 (higher = closer to training)
};
```

## Adding TTS to Other Processes

If you create additional mental processes, add TTS like this:

```typescript
import { speakWithAudio } from './lib/tts.ts';

const myProcess: MentalProcess = async ({ workingMemory }) => {
  const [withDialog, response] = await someStep(workingMemory);

  // This automatically handles both text and audio
  await speakWithAudio(response);

  return withDialog;
};
```

## Client-Side Implementation

Your client needs to handle audio events. The audio comes as base64-encoded MP3:

```typescript
// Example for web clients
soul.on('dispatch', (event) => {
  if (event.action === 'audio') {
    // Decode base64 and play
    const audioBlob = new Blob([atob(event.content)], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);
    new Audio(audioUrl).play();
  }
});
```

## Troubleshooting

**No audio?**

- Ensure ElevenLabs MCP server is running
- Check that voice ID `82QdbKjAV5CMGd9tIUCB` exists in your account
- Verify API key is configured in MCP settings
- Look for errors in console logs

**Audio quality issues?**

- Try increasing `stability` for more consistent voice
- Try `eleven_multilingual_v2` model for better quality
- Adjust `similarityBoost` to fine-tune voice matching

## Full Documentation

See `TTS_INTEGRATION.md` for complete details, including:

- Architecture overview
- Advanced usage patterns
- Client implementation examples
- Troubleshooting guide
- Future enhancement ideas

## MCP Configuration

This integration requires the ElevenLabs MCP server with the `text-to-speech` tool enabled. Make sure your MCP configuration includes your ElevenLabs API key.

## Notes

- TTS generation happens after text streaming completes
- Audio is sent as a separate dispatch event
- The integration gracefully handles errors (falls back to text-only)
- No changes needed to existing cognitive steps

Enjoy SPARK's new voice! 🎙️
