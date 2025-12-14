"use client";
import SparkChat from "@/components/SparkChat";
import { NextPage } from "next";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SparkPageContent() {
  const searchParams = useSearchParams();
  
  // Default values for Spark soul - use "local" for local development
  const organizationSlug = searchParams.get("org") || "local";
  const subroutineId = searchParams.get("soul") || "SPARK";
  const chatId = searchParams.get("chat") || "spark-terminal";

  return (
    <div className="min-h-screen bg-white">
      <SparkChat
        chatId={chatId}
        organizationSlug={organizationSlug}
        subroutineId={subroutineId}
      />
    </div>
  );
}

const SparkPage: NextPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-black font-mono animate-pulse">Loading SPARK Terminal...</div>
      </div>
    }>
      <SparkPageContent />
    </Suspense>
  );
};

export default SparkPage;
