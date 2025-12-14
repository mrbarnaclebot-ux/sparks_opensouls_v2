"use client";
import { PageData, PageState } from "./SparkChat";

const statusConfig: Record<PageState, { label: string; dotClass: string; textClass: string }> = {
  pending: {
    label: "LOADING",
    dotClass: "bg-yellow-500 animate-pulse",
    textClass: "text-yellow-700",
  },
  "auth-mismatch": {
    label: "AUTH ERROR",
    dotClass: "bg-orange-500",
    textClass: "text-orange-700",
  },
  error: {
    label: "ERROR",
    dotClass: "bg-red-500",
    textClass: "text-red-700",
  },
  connected: {
    label: "ONLINE",
    dotClass: "bg-green-500 animate-pulse",
    textClass: "text-green-700",
  },
  disconnected: {
    label: "OFFLINE",
    dotClass: "bg-gray-500",
    textClass: "text-gray-700",
  },
};

interface SparkHeaderProps {
  pageState: PageData;
}

export default function SparkHeader({ pageState }: SparkHeaderProps) {
  const config = statusConfig[pageState.state];

  return (
    <div className="flex items-center gap-2 px-3 py-1 border-2 border-black bg-white">
      <span
        className={`w-2 h-2 rounded-full ${config.dotClass}`}
        aria-hidden="true"
      />
      <span className={`text-xs font-bold tracking-wider ${config.textClass}`}>
        {config.label}
      </span>
    </div>
  );
}
