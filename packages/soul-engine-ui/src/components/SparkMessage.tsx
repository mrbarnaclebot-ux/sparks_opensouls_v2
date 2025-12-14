"use client";
import { SoulEvent } from "@opensouls/engine";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

interface SparkMessageProps {
  message: SoulEvent;
  isSoul: boolean;
  isUser: boolean;
  isError?: boolean;
}

export default function SparkMessage({
  message,
  isSoul,
  isUser,
  isError = false,
}: SparkMessageProps) {
  const content = message.content?.replace(/Interlocutor said:/i, "").trim();

  // Error message styling
  if (isError) {
    return (
      <div className="flex items-start gap-3 animate-fadeIn">
        <div className="w-8 h-8 flex items-center justify-center border-2 border-red-500 bg-red-50 text-red-600 font-bold text-xs">
          !
        </div>
        <div className="flex-1 px-3 py-2 border-2 border-red-500 bg-red-50">
          <p className="text-red-700 text-sm font-mono break-words" style={{ overflowWrap: "anywhere" }}>
            ERROR: {content || "An unknown error occurred"}
          </p>
        </div>
      </div>
    );
  }

  // User message
  if (isUser) {
    return (
      <div className="flex items-start gap-3 justify-end animate-fadeIn">
        <div className="flex flex-col items-end max-w-[80%]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(message._timestamp), { addSuffix: true })}
            </span>
            <span className="text-xs font-bold text-gray-700 tracking-wider">
              {message.name || "USER"}
            </span>
          </div>
          <div className="px-4 py-2 border-2 border-black bg-black text-white">
            <p className="text-sm break-words" style={{ overflowWrap: "anywhere" }}>
              {content || "..."}
            </p>
          </div>
        </div>
        <div className="w-8 h-8 flex items-center justify-center border-2 border-black bg-white text-black font-bold text-xs flex-shrink-0">
          U
        </div>
      </div>
    );
  }

  // Soul (SPARK) message
  if (isSoul) {
    return (
      <div className="flex items-start gap-3 animate-fadeIn">
        <Image
          src="/soul-avatars/spark-icon.png"
          alt="SPARK"
          width={32}
          height={32}
          className="rounded-full border-2 border-black flex-shrink-0"
        />
        <div className="flex flex-col max-w-[80%]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-black tracking-wider">
              {message.name || "SPARK"}
            </span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(message._timestamp), { addSuffix: true })}
            </span>
          </div>
          <div className="px-4 py-2 border-2 border-black bg-white">
            <p className="text-sm text-black break-words" style={{ overflowWrap: "anywhere" }}>
              {content || "..."}
            </p>
          </div>
          {message.action && message.action !== "says" && message.action !== "said" && (
            <span className="mt-1 text-xs text-gray-500 font-mono">
              [{message.action}]
            </span>
          )}
        </div>
      </div>
    );
  }

  // Default/System message (shouldn't normally be shown)
  return (
    <div className="flex items-center justify-center animate-fadeIn">
      <div className="px-3 py-1 border border-gray-300 bg-gray-50">
        <p className="text-xs text-gray-600 font-mono">
          {">"} {content || "System message"}
        </p>
      </div>
    </div>
  );
}
