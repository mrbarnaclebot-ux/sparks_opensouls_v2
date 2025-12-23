"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { SoulEvent } from "@opensouls/engine";

// ElevenLabs API key - in production, this should be in environment variables
const ELEVENLABS_API_KEY = "sk_a757153cadb17e80ff7ce0a51a62e6231aab1a8bef424ce2";

interface TTSMetadata {
  voiceId: string;
  modelId: string;
  voiceSettings: {
    stability: number;
    similarityBoost: number;
  };
}

interface TTSEvent {
  action: string;
  content: string;
  name: string;
  _metadata?: TTSMetadata;
}

export function useTTS(events: SoulEvent[] | undefined) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const processedEventsRef = useRef<Set<string>>(new Set());
  const audioQueueRef = useRef<string[]>([]);
  const isPlayingRef = useRef(false);

  const playNextInQueue = useCallback(async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) {
      return;
    }

    isPlayingRef.current = true;
    const audioUrl = audioQueueRef.current.shift();

    if (audioUrl) {
      try {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        setIsSpeaking(true);

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          setIsSpeaking(false);
          isPlayingRef.current = false;
          playNextInQueue();
        };

        audio.onerror = () => {
          setError("Failed to play audio");
          setIsSpeaking(false);
          isPlayingRef.current = false;
          playNextInQueue();
        };

        await audio.play();
      } catch (err) {
        console.error("Audio playback error:", err);
        setIsSpeaking(false);
        isPlayingRef.current = false;
        playNextInQueue();
      }
    }
  }, []);

  const generateSpeech = useCallback(
    async (text: string, metadata?: TTSMetadata) => {
      if (!text.trim()) return;

      const voiceId = metadata?.voiceId || "82QdbKjAV5CMGd9tIUCB";
      // Use eleven_turbo_v2_5 for free tier (v1 models deprecated)
      const modelId = "eleven_turbo_v2_5";
      const voiceSettings = metadata?.voiceSettings || {
        stability: 0.5,
        similarityBoost: 0.75,
      };

      try {
        setError(null);
        console.log("[TTS] Generating speech for:", text.substring(0, 50) + "...");

        const response = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
          {
            method: "POST",
            headers: {
              Accept: "audio/mpeg",
              "Content-Type": "application/json",
              "xi-api-key": ELEVENLABS_API_KEY,
            },
            body: JSON.stringify({
              text,
              model_id: modelId,
              voice_settings: {
                stability: voiceSettings.stability,
                similarity_boost: voiceSettings.similarityBoost,
              },
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        console.log("[TTS] Audio generated successfully");

        // Add to queue
        audioQueueRef.current.push(audioUrl);
        playNextInQueue();
      } catch (err) {
        console.error("[TTS] Error generating speech:", err);
        setError(err instanceof Error ? err.message : "Unknown TTS error");
      }
    },
    [playNextInQueue]
  );

  // Process TTS events from soul
  useEffect(() => {
    if (!events) return;

    // Look for dispatch events with action "tts"
    for (const event of events) {
      // Create unique ID for this event
      const eventId = `${event._id}-${event._timestamp}`;

      // Skip if already processed
      if (processedEventsRef.current.has(eventId)) continue;

      // Check if this is a TTS dispatch event
      const isDispatchEvent = event.action === "dispatches" || event.action === "dispatch";
      const isTTSEvent = event._metadata?.action === "tts";
      
      // Also check for direct TTS action
      const isDirectTTS = (event as any).action === "tts";

      if ((isDispatchEvent && isTTSEvent) || isDirectTTS) {
        processedEventsRef.current.add(eventId);

        const content = (event._metadata?.content || (event as any).content) as string;
        const metadata = (event._metadata?._metadata || event._metadata) as TTSMetadata | undefined;

        if (content) {
          console.log("[TTS] Detected TTS event:", content.substring(0, 30) + "...");
          generateSpeech(content, metadata);
        }
      }
    }
  }, [events, generateSpeech]);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    setIsSpeaking(false);
  }, []);

  return {
    isSpeaking,
    error,
    stopSpeaking,
    generateSpeech,
  };
}
