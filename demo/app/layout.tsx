import type { Metadata } from "next";
import * as React from "react";
import "@fontsource-variable/geist/index.css";
import "@fontsource-variable/geist-mono/index.css";
import "./globals.css";
import "./type-scale.css";
import "./design-overlay.css";
import { MotionProvider } from "@/components/MotionProvider";

export const metadata: Metadata = {
  title: "agentic-cli-workspace — live agent demo",
  description:
    "Watch a plan-act-observe agent loop run for real: whole-plan rewrites, PreToolUse safety guards, a sandboxed file tool, and a budget that actually stops the run. No LLM, no network, no API keys.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#app" className="skip-link">
          Skip to the demo
        </a>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
