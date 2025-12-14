"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FaArrowUp, FaCircle, FaRotateRight } from "react-icons/fa6";
import { useDebugChatState } from "@/hooks/useDebugChatState";
import { Events, SoulEvent, SoulEventKinds } from "@opensouls/engine";

type ConnectionStatus = "connecting" | "online" | "offline" | "error";
type ErrorType = "api_key" | "disconnected" | "unknown" | null;

// Configuration for Spark soul
const ORGANIZATION_SLUG = process.env.NEXT_PUBLIC_ORGANIZATION_SLUG || "local";
const SUBROUTINE_ID = process.env.NEXT_PUBLIC_SUBROUTINE_ID || "SPARK";

// Generate unique chat ID per browser session
const getOrCreateChatId = () => {
  if (typeof window === "undefined") return "spark-terminal-default";
  
  let chatId = sessionStorage.getItem("spark-chat-id");
  if (!chatId) {
    chatId = `spark-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem("spark-chat-id", chatId);
  }
  return chatId;
};

const defaultUserPerception = {
  name: "Interlocutor",
  action: "says",
  internal: false,
  _kind: SoulEventKinds.Perception,
  _metadata: undefined,
};

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [chatId, setChatId] = useState<string>("spark-terminal-default");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate chat ID on client side only
  useEffect(() => {
    setChatId(getOrCreateChatId());
  }, []);

  // Connect to Soul Engine
  const { state, provider, events, revertTo, metadata } = useDebugChatState(
    ORGANIZATION_SLUG,
    SUBROUTINE_ID,
    chatId
  );

  // Derive connection status from metadata
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [errorType, setErrorType] = useState<ErrorType>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (!metadata?.connection) {
      setStatus("connecting");
      return;
    }

    switch (metadata.connection) {
      case "connected":
        setStatus("online");
        break;
      case "disconnected":
        setStatus("offline");
        setErrorType("disconnected");
        setErrorMessage("*whimpers* I've lost my connection... please help me reconnect!");
        break;
      case "notFound":
      case "error":
        setStatus("error");
        setErrorType("unknown");
        setErrorMessage("*confused bark* I can't find my way to the Soul Engine...");
        break;
      default:
        setStatus("connecting");
    }
  }, [metadata?.connection]);

  // Get events from either the events array or state.eventLog
  const allEvents = events?.length > 0 ? events : (state?.eventLog || []);

  // Check for API errors in events
  useEffect(() => {
    if (allEvents?.length > 0) {
      const errorEvents = (allEvents as any[]).filter((e: any) => {
        const plain = typeof (e as any).toJSON === "function" ? (e as any).toJSON() : JSON.parse(JSON.stringify(e));
        return plain._kind === "system" && plain.content?.toLowerCase().includes("error");
      });

      if (errorEvents.length > 0) {
        const lastError = errorEvents[errorEvents.length - 1];
        const plain = typeof lastError.toJSON === "function" ? lastError.toJSON() : JSON.parse(JSON.stringify(lastError));

        if (plain.content?.includes("401") || plain.content?.toLowerCase().includes("api key")) {
          setErrorType("api_key");
          setErrorMessage("*sad woof* My brain isn't working... the API key seems broken! Please check the OPENAI_API_KEY in souls/SPARK/.env");
        } else if (plain.content) {
          setErrorType("unknown");
          setErrorMessage(`*worried bark* Something went wrong: ${plain.content.substring(0, 100)}`);
        }
      }
    }
  }, [allEvents?.length]);

  // Reset chat function
  const handleResetChat = useCallback(() => {
    if (revertTo) {
      revertTo("initial");
      setErrorType(null);
      setErrorMessage("");
    }
  }, [revertTo]);

  // Filter chat messages from events
  const chatMessages = allEvents?.filter((m: any) => {
    const plain = typeof m.toJSON === "function" ? m.toJSON() : JSON.parse(JSON.stringify(m));
    const kind = String(plain._kind || "").toLowerCase();

    const isPerception = kind === "perception";
    const isInteractionRequest = kind === "interactionrequest";
    const isSoulSpeech = plain.action === "said" || plain.action === "says";

    const isChat = (isPerception || isInteractionRequest || isSoulSpeech) &&
      !["mainThreadStart", "mainThreadStop", "subProcessStart", "subProcessStop"].includes(plain.action) &&
      !plain.internal;

    return isChat;
  }).map((m: any) => {
    const plainMessage = typeof m.toJSON === "function" ? m.toJSON() : JSON.parse(JSON.stringify(m));
    return plainMessage;
  }) || [];

  // Check if soul is currently processing
  const isProcessing = (() => {
    const lastMainThreadStartIndex = events
      ?.map((event: SoulEvent, index: number) => ({ event, index }))
      .filter(({ event }: { event: SoulEvent }) => event.action === "mainThreadStart")
      .map(({ index }: { index: number }) => index)
      .pop();

    if (lastMainThreadStartIndex !== undefined) {
      const subsequentEvents = events.slice(lastMainThreadStartIndex + 1);
      return !subsequentEvents.some(
        (event: SoulEvent) => event.action === "mainThreadStop"
      );
    }
    return false;
  })();

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages.length, errorMessage]);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Send message to Soul Engine
  const handleSendMessage = useCallback(() => {
    if (!inputValue.trim() || status !== "online" || !provider) return;

    const perception = { ...defaultUserPerception, content: inputValue.trim() };
    const request = JSON.stringify({
      event: Events.dispatchExternalPerception,
      data: {
        perception,
      },
    });

    provider.sendStateless(request);
    setInputValue("");
  }, [inputValue, status, provider]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const statusConfig: Record<ConnectionStatus, { color: string; label: string }> = {
    connecting: { color: "text-amber-500", label: "CONNECTING..." },
    online: { color: "text-black", label: "ONLINE" },
    offline: { color: "text-gray-500", label: "OFFLINE" },
    error: { color: "text-red-500", label: "ERROR" },
  };

  const getSoulName = () => {
    const env = metadata?.environment as { [key: string]: string } | undefined;
    return env?.entityName ?? state?.attributes?.name ?? "SPARK";
  };

  // Get status message for Spark
  const getStatusMessage = () => {
    if (status === "offline") {
      return "*whimpers* I seem to be offline... please restart the Soul Engine!";
    }
    if (status === "error") {
      return "*confused bark* I can't connect... have you run 'bunx soul-engine dev' in souls/SPARK?";
    }
    if (status === "connecting") {
      return "*tail wagging* Waking up... just a moment!";
    }
    return null;
  };

  const statusMessage = getStatusMessage();

  return (
    <div className="terminal-container">
      {/* Terminal Window */}
      <div className="terminal-window">
        {/* Terminal Header */}
        <div className="terminal-header">
          <div className="terminal-title">
            <span className="terminal-prompt">&gt;</span> SPARK_TERMINAL v1.0
          </div>
          <div className="terminal-actions">
            <button
              onClick={handleResetChat}
              className="reset-button"
              title="Reset Chat"
            >
              <FaRotateRight className="reset-icon" />
            </button>
            <div className="terminal-status">
              <FaCircle className={`status-dot ${statusConfig[status].color}`} />
              <span className="status-label">{statusConfig[status].label}</span>
            </div>
          </div>
        </div>

        {/* Spark Avatar */}
        <div className="spark-avatar-container">
          <Image
            src="/pixel-spark.png"
            alt="Spark"
            width={120}
            height={120}
            className={`spark-avatar ${status !== "online" ? "spark-offline" : ""}`}
            priority
          />
        </div>

        {/* Messages Area */}
        <div className="messages-container">
          {chatMessages.length === 0 && !statusMessage && !errorMessage && (
            <div className="welcome-message">
              <p className="welcome-text">&gt; SYSTEM: Welcome to Spark Terminal</p>
              <p className="welcome-text">&gt; SYSTEM: {status === "online" ? "Connected to Soul Engine. Type a message to begin..." : "Waiting for connection..."}</p>
            </div>
          )}

          {/* Status Message from Spark */}
          {statusMessage && (
            <div className="message message-spark">
              <div className="message-header">
                <Image
                  src="/spark-icon.png"
                  alt="Spark"
                  width={24}
                  height={24}
                  className="message-avatar"
                />
                <span className="message-sender">&gt; SPARK</span>
                <span className="message-status-badge">STATUS</span>
              </div>
              <div className="message-content message-status">{statusMessage}</div>
            </div>
          )}

          {/* Error Message from Spark */}
          {errorMessage && errorType && (
            <div className="message message-spark message-error">
              <div className="message-header">
                <Image
                  src="/spark-icon.png"
                  alt="Spark"
                  width={24}
                  height={24}
                  className="message-avatar"
                />
                <span className="message-sender">&gt; SPARK</span>
                <span className="message-error-badge">ERROR</span>
              </div>
              <div className="message-content message-error-text">{errorMessage}</div>
            </div>
          )}

          {chatMessages.map((message: any, index: number) => {
            const kind = String(message._kind || "").toLowerCase();
            const isUser = kind === "perception";
            const isSoul = kind === "interactionrequest";
            const senderName = isUser ? "YOU" : getSoulName();

            return (
              <div
                key={message._id || `msg-${index}`}
                className={`message ${isUser ? "message-user" : "message-spark"}`}
              >
                <div className="message-header">
                  {isSoul && (
                    <Image
                      src="/spark-icon.png"
                      alt="Spark"
                      width={24}
                      height={24}
                      className="message-avatar"
                    />
                  )}
                  <span className="message-sender">
                    &gt; {senderName}
                  </span>
                  <span className="message-time">[{formatTime(message._timestamp)}]</span>
                </div>
                <div className="message-content">{message.content}</div>
              </div>
            );
          })}

          {isProcessing && (
            <div className="message message-spark">
              <div className="message-header">
                <Image
                  src="/spark-icon.png"
                  alt="Spark"
                  width={24}
                  height={24}
                  className="message-avatar"
                />
                <span className="message-sender">&gt; {getSoulName()}</span>
              </div>
              <div className="typing-indicator">
                <span className="typing-dot">█</span>
                <span className="typing-cursor">_</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="input-container">
          <div className="input-wrapper">
            <span className="input-prompt">&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={status === "online" ? "Type your message..." : status === "error" ? "Soul Engine not running..." : "Connecting..."}
              disabled={status !== "online"}
              className="terminal-input"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || status !== "online"}
              className="send-button"
            >
              <FaArrowUp className="send-icon" />
            </button>
          </div>
        </div>

        {/* Terminal Footer */}
        <div className="terminal-footer">
          <span className="footer-text">SPARK AI TERMINAL | POWERED BY SOUL ENGINE</span>
        </div>
      </div>
    </div>
  );
}
