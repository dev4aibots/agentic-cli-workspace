import type { Metadata } from "next";
import * as React from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "agentic-cli-workspace — live agent demo",
  description:
    "Deterministic scripted agent loop with budget gates, PreToolUse safety hooks, and an eval harness. No LLM, no network, no API keys.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
