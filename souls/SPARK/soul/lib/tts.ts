import { useActions } from "@opensouls/engine";

/**
 * Configuration for Spark's ElevenLabs voice
 */
export const SPARK_VOICE_CONFIG = {
  voiceId: "82QdbKjAV5CMGd9tIUCB",
  modelId: "eleven_monolingual_v1",
  stability: 0.5,
  similarityBoost: 0.75,
} as const;

/**
 * Collects streamed text into a complete string
 */
async function collectStreamedText(stream: AsyncIterable<string>): Promise<string> {
  let fullText = "";
  for await (const chunk of stream) {
    fullText += chunk;
  }
  return fullText;
}

/**
 * Speaks text with TTS audio request
 * 
 * Since the soul engine sandbox doesn't have access to fetch,
 * we dispatch a "tts" action with the text and voice configuration.
 * The client should handle the ElevenLabs API call and play the audio.
 * 
 * @param text The text to speak (string or stream)
 * @param generateAudio Whether to dispatch TTS request (default: true)
 */
export async function speakWithAudio(text: string | AsyncIterable<string>, generateAudio: boolean = true) {
  const { speak, dispatch, log } = useActions();

  // Handle streaming text - collect it first
  const finalText = typeof text === "string" ? text : await collectStreamedText(text);

  // Send the text response immediately
  speak(finalText);

  // Dispatch TTS request to client
  if (generateAudio && finalText.trim()) {
    log("Dispatching TTS request to client...");
    
    dispatch({
      action: "tts",
      content: finalText,
      name: "SPARK",
      _metadata: {
        voiceId: SPARK_VOICE_CONFIG.voiceId,
        modelId: SPARK_VOICE_CONFIG.modelId,
        voiceSettings: {
          stability: SPARK_VOICE_CONFIG.stability,
          similarityBoost: SPARK_VOICE_CONFIG.similarityBoost,
        },
      },
    });
    
    log("TTS request dispatched");
  }
}
