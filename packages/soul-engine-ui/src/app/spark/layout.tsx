import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SPARK Terminal",
  description: "Chat with SPARK - AI Soul Engine",
};

export default function SparkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  );
}
