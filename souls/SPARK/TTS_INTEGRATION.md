# SPARK ElevenLabs Text-to-Speech Integration

This document explains how SPARK uses ElevenLabs for voice synthesis.

## Overview

SPARK dispatches TTS requests via the `dispatch` system. The soul engine sandbox doesn't have direct access to external APIs, so your client application must handle the ElevenLabs API calls.

## Architecture

```
SPARK Soul                          Client Application
    │                                       │
    │ speak(text)  ──────────────────────► Text displayed
    │                                       │
    │ dispatch({action: "tts", ...})  ────► Handle TTS request
    │                                       │
    │                                       ├──► Call ElevenLabs API
    │                                       │
    │                                       └──► Play audio
```

## Voice Configuration

Located in `soul/lib/tts.ts`:

```typescript
export const SPARK_VOICE_CONFIG = {
  voiceId: '82QdbKjAV5CMGd9tIUCB', // Your custom voice
  modelId: 'eleven_monolingual_v1',
  stability: 0.5,
  similarityBoost: 0.75,
};
```

## Soul Side - How It Works

When SPARK speaks, `speakWithAudio()` does two things:

1. **Sends text** via `speak()` - displays in chat
2. **Dispatches TTS request** via `dispatch()` - triggers audio generation

The TTS dispatch payload looks like:

```typescript
{
  action: "tts",
  content: "Hello! I'm SPARK!",
  name: "SPARK",
  _metadata: {
    voiceId: "82QdbKjAV5CMGd9tIUCB",
    modelId: "eleven_monolingual_v1",
    voiceSettings: {
      stability: 0.5,
      similarityBoost: 0.75,
    },
  },
}
```

## Client Side - Implementation Required

Your client needs to listen for `tts` dispatch events and call the ElevenLabs API.

### Example: React Client

```typescript
import { useSoul } from '@opensouls/react';

function SparkChat() {
  const { soul } = useSoul();

  // Your ElevenLabs API key (keep secure!)
  const ELEVENLABS_API_KEY = 'sk_...your_key...';

  useEffect(() => {
    const handleDispatch = async (event: any) => {
      if (event.action === 'tts') {
        // Call ElevenLabs API
        await generateAndPlayAudio(event);
      }
    };

    soul?.on('dispatch', handleDispatch);
    return () => soul?.off('dispatch', handleDispatch);
  }, [soul]);

  async function generateAndPlayAudio(event: any) {
    const { content, _metadata } = event;
    const { voiceId, modelId, voiceSettings } = _metadata;

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          Accept: 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: content,
          model_id: modelId,
          voice_settings: {
            stability: voiceSettings.stability,
            similarity_boost: voiceSettings.similarityBoost,
          },
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        await audio.play();
      }
    } catch (error) {
      console.error('TTS failed:', error);
    }
  }

  return <div>{/* Your chat UI */}</div>;
}
```

### Example: Vanilla JavaScript

```javascript
// Listen for soul events
soul.on('dispatch', async (event) => {
  if (event.action === 'tts') {
    const { content, _metadata } = event;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${_metadata.voiceId}`,
      {
        method: 'POST',
        headers: {
          Accept: 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': YOUR_ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: content,
          model_id: _metadata.modelId,
          voice_settings: {
            stability: _metadata.voiceSettings.stability,
            similarity_boost: _metadata.voiceSettings.similarityBoost,
          },
        }),
      }
    );

    const blob = await response.blob();
    const audio = new Audio(URL.createObjectURL(blob));
    audio.play();
  }
});
```

## Security Considerations

⚠️ **Important**: Never expose your ElevenLabs API key in client-side code for production!

For production, create a backend proxy:

```typescript
// Backend: /api/tts
app.post('/api/tts', async (req, res) => {
  const { text, voiceId, modelId, voiceSettings } = req.body;

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      Accept: 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': process.env.ELEVENLABS_API_KEY,
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: voiceSettings,
    }),
  });

  const buffer = await response.arrayBuffer();
  res.setHeader('Content-Type', 'audio/mpeg');
  res.send(Buffer.from(buffer));
});

// Client: calls your backend instead
const response = await fetch('/api/tts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(event._metadata),
});
```

## Voice Settings

Adjust `SPARK_VOICE_CONFIG` in `soul/lib/tts.ts`:

| Setting           | Range   | Effect                                                               |
| ----------------- | ------- | -------------------------------------------------------------------- |
| `stability`       | 0.0-1.0 | Lower = more expressive, Higher = more consistent                    |
| `similarityBoost` | 0.0-1.0 | Lower = more creative, Higher = closer to training                   |
| `modelId`         | string  | `eleven_monolingual_v1` (fast) or `eleven_multilingual_v2` (quality) |

## Troubleshooting

### No audio playing

1. Check that your client listens for `dispatch` events
2. Verify the event `action` is `'tts'`
3. Check browser console for errors
4. Verify ElevenLabs API key is valid

### Poor audio quality

- Try `eleven_multilingual_v2` model
- Increase `stability` for more consistent voice
- Adjust `similarityBoost` to fine-tune

### API errors

- Verify voice ID exists in your ElevenLabs account
- Check API key permissions
- Monitor rate limits

## Resources

- [ElevenLabs API Documentation](https://docs.elevenlabs.io/)
- [Soul Engine Documentation](https://docs.souls.dev/)
- [@opensouls/react](https://github.com/opensouls/soul-engine)

## Your Configuration

- **Voice ID**: `82QdbKjAV5CMGd9tIUCB`
- **Model**: `eleven_monolingual_v1`
- **API Key**: Set in your client application (keep secure!)
