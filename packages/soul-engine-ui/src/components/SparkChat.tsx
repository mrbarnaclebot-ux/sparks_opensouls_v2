"use client";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { useDebugChatState } from "@/hooks/useDebugChatState";
import { SoulEvent, SoulEventKinds, Events } from "@opensouls/engine";
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";
import SparkHeader from "./SparkHeader";
import SparkMessage from "./SparkMessage";

export type PageState = 'pending' | 'auth-mismatch' | 'error' | 'connected' | 'disconnected';

export type PageData = {
  state: PageState;
  text: string;
};

const INIT_PAGE: PageData = {
  state: 'pending',
  text: 'Initializing SPARK...',
};

type AlertType = 'error' | 'warning' | 'info' | 'success';

interface Alert {
  id: string;
  type: AlertType;
  message: string;
}

const SparkChat: React.FC<{
  organizationSlug: string;
  subroutineId: string;
  chatId: string;
}> = ({ organizationSlug, subroutineId, chatId }) => {
  const { state, provider, events, revertTo, metadata } = useDebugChatState(
    organizationSlug,
    subroutineId,
    chatId
  );

  const [messageInput, setMessageInput] = useState("");
  const [pageState, setPageState] = useState<PageData>(INIT_PAGE);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isChatScrolled, setIsChatScrolled] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Add alert helper
  const addAlert = useCallback((type: AlertType, message: string) => {
    const id = uuidv4();
    setAlerts(prev => [...prev, { id, type, message }]);
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, 5000);
  }, []);

  // Remove alert helper
  const removeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  // Handle connection state changes
  useEffect(() => {
    if (!metadata?.connection) {
      return;
    }

    if (metadata.connection === 'error') {
      setPageState({ state: 'error', text: 'Connection error occurred.' });
      addAlert('error', 'Failed to connect to SPARK. Please check your connection.');
    } else if (metadata.connection === 'notFound') {
      setPageState({ state: 'error', text: 'Soul not found. Run \'bunx soul-engine dev\' first.' });
      addAlert('warning', 'SPARK soul not found. Make sure the soul engine is running.');
    } else if (metadata.connection === 'disconnected') {
      setPageState({ state: 'disconnected', text: 'SPARK is offline.' });
      addAlert('info', 'SPARK has disconnected.');
    } else {
      setPageState({ state: 'connected', text: 'SPARK is online.' });
    }
  }, [metadata?.connection, addAlert]);

  // Track typing state from events
  useEffect(() => {
    const isRunningMainThread = (() => {
      const lastMainThreadStartIndex = events
        ?.map((event, index) => ({ event, index }))
        .filter(({ event }) => event.action === "mainThreadStart")
        .map(({ index }) => index)
        .pop();

      if (lastMainThreadStartIndex !== undefined) {
        const subsequentEvents = events.slice(lastMainThreadStartIndex + 1);
        return !subsequentEvents.some(
          (event) => event.action === "mainThreadStop"
        );
      }
      return false;
    })();
    setIsTyping(isRunningMainThread);
  }, [events]);

  // Send message handler
  const sendMessage = useCallback(() => {
    const trimmedMessage = messageInput.trim();
    
    if (!trimmedMessage) {
      addAlert('warning', 'Please enter a message before sending.');
      return;
    }

    if (pageState.state !== 'connected') {
      addAlert('error', 'Cannot send message. SPARK is not connected.');
      return;
    }

    try {
      const request = JSON.stringify({
        event: Events.dispatchExternalPerception,
        data: {
          perception: {
            name: "User",
            action: "says",
            internal: false,
            _kind: SoulEventKinds.Perception,
            content: trimmedMessage,
          },
        },
      });

      provider.sendStateless(request);
      setMessageInput("");
      
      // Scroll to bottom after sending
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      addAlert('error', 'Failed to send message. Please try again.');
      console.error('Send message error:', error);
    }
  }, [provider, messageInput, pageState.state, addAlert]);

  // Reset chat handler
  const handleReset = useCallback(() => {
    try {
      revertTo("initial");
      addAlert('success', 'Chat has been reset successfully.');
    } catch (error) {
      addAlert('error', 'Failed to reset chat. Please try again.');
      console.error('Reset error:', error);
    }
  }, [revertTo, addAlert]);

  // Scroll handling
  const handleScroll = useCallback(() => {
    if (chatContainerRef.current) {
      const { scrollHeight, scrollTop, clientHeight } = chatContainerRef.current;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      setIsChatScrolled(distanceFromBottom > 100);
    }
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior,
      });
    }
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    if (!isChatScrolled) {
      setTimeout(() => scrollToBottom(), 50);
    }
  }, [events?.length, isChatScrolled, scrollToBottom]);

  // Filter chat messages
  const chatMessages = events?.filter((m: SoulEvent) => {
    return (
      (m._kind === SoulEventKinds.InteractionRequest ||
        m._kind === SoulEventKinds.System ||
        m._kind === SoulEventKinds.Perception) &&
      !["mainThreadStart", "mainThreadStop", "subProcessStart", "subProcessStop"].includes(m.action)
    );
  }) || [];

  const canSend = pageState.state === 'connected' && messageInput.trim().length > 0;

  // Get alert styles
  const getAlertStyles = (type: AlertType) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-400 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-400 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-400 text-blue-800';
      case 'success':
        return 'bg-green-50 border-green-400 text-green-800';
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-white text-black font-mono">
      {/* Alerts Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`px-4 py-3 border-l-4 rounded shadow-lg animate-fadeIn ${getAlertStyles(alert.type)}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm">{alert.message}</span>
              <button
                onClick={() => removeAlert(alert.id)}
                className="text-current opacity-60 hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Terminal Header */}
      <div className="flex-shrink-0 border-b-2 border-black bg-white">
        <div className="flex items-center justify-between px-4 py-2 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-wider">SPARK_TERMINAL</span>
            <span className="text-gray-500 text-sm hidden sm:inline">v1.0.0</span>
          </div>
          <div className="flex items-center gap-3">
            <SparkHeader pageState={pageState} />
            <button
              onClick={handleReset}
              className="px-3 py-1 border-2 border-black text-black text-sm font-bold hover:bg-black hover:text-white transition-colors duration-200"
            >
              RESET
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col items-center overflow-hidden px-4 py-6 sm:px-6">
        {/* Spark Avatar */}
        <div className="flex-shrink-0 mb-4 sm:mb-6">
          <div className="relative">
            <Image
              src="/soul-avatars/pixel-spark.png"
              alt="SPARK"
              width={120}
              height={120}
              className="pixelated sm:w-[150px] sm:h-[150px]"
              priority
            />
            {isTyping && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            )}
          </div>
        </div>

        {/* Chat Messages Container */}
        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 w-full max-w-2xl overflow-y-auto border-2 border-black bg-white"
        >
          <div className="p-4 space-y-4">
            {/* Welcome Message */}
            {chatMessages.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600 text-sm">
                  {">"} Welcome to SPARK Terminal
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  Type a message below to start chatting
                </p>
              </div>
            )}

            {/* Chat Messages */}
            {chatMessages.map((m: SoulEvent, i: number) => {
              const isSoul = m._kind === SoulEventKinds.InteractionRequest;
              const isUser = m._kind === SoulEventKinds.Perception && !m.internal;
              const isSystem = m._kind === SoulEventKinds.System || m.internal;
              const isError = m._metadata?.type === "error";

              if (isSystem && !isError) return null;

              return (
                <SparkMessage
                  key={`message-${m._id || i}`}
                  message={m}
                  isSoul={isSoul}
                  isUser={isUser}
                  isError={isError}
                />
              );
            })}

            {/* Typing Indicator in Messages */}
            {isTyping && (
              <div className="flex items-start gap-3">
                <Image
                  src="/soul-avatars/spark-icon.png"
                  alt="SPARK"
                  width={32}
                  height={32}
                  className="rounded-full border border-black"
                />
                <div className="px-3 py-2 border border-gray-300 bg-gray-50">
                  <span className="text-gray-500 text-sm">SPARK is thinking...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scroll to Bottom Button */}
        {isChatScrolled && (
          <button
            onClick={() => scrollToBottom()}
            className="absolute bottom-32 right-8 p-2 bg-black text-white border-2 border-black shadow-lg hover:bg-white hover:text-black transition-colors"
          >
            ↓
          </button>
        )}
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t-2 border-black bg-white px-4 py-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-lg font-bold hidden sm:inline">{">"}</span>
            <input
              ref={inputRef}
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canSend) {
                  sendMessage();
                }
              }}
              placeholder={pageState.state === 'connected' ? "Type your message..." : "Waiting for connection..."}
              disabled={pageState.state !== 'connected'}
              className="flex-1 px-4 py-2 border-2 border-black bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={sendMessage}
              disabled={!canSend}
              className="px-4 py-2 sm:px-6 border-2 border-black bg-black text-white font-bold hover:bg-white hover:text-black transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:text-white"
            >
              SEND
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send • {pageState.text}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SparkChat;
