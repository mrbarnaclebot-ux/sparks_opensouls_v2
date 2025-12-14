import "./globals.css";
import "@radix-ui/themes/styles.css";

import { Theme } from "@radix-ui/themes";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Spark Terminal",
  description: "Talk to Spark - AI Soul Terminal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light-theme light" style={{ colorScheme: "light" }}>
      <link rel="icon" href="/icon.png" sizes="any" />
      <body>
        <Theme
          appearance="light"
          accentColor="gray"
          grayColor="slate"
          panelBackground="solid"
          radius="small"
        >
          {children}
        </Theme>
      </body>
    </html>
  );
}
