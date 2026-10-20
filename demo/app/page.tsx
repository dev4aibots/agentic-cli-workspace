import { BlurText } from "@/components/BlurText";
import { AppSection } from "@/components/AppSection";
import { HeroCta } from "@/components/HeroCta";
import { Separator } from "@/components/ui/scroll-area";

export default function Page() {
  return (
    <div className="min-h-screen">
      {/* Top nav — keyboard-first chrome */}
      <header
        className="flex h-12 items-center justify-between border-b px-6"
        style={{ borderColor: "var(--color-border-hairline)", height: "var(--nav-height)" }}
      >
        <div className="flex items-center gap-3">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-md text-body font-semibold"
            style={{
              background: "var(--color-accent)",
              color: "var(--color-text-on-accent)",
            }}
            aria-hidden="true"
          >
            A
          </span>
          <span className="mono text-body" style={{ color: "var(--color-text-primary)" }}>
            agentic-cli-workspace
          </span>
          <span className="text-caption hidden sm:inline">live demo</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="mono text-caption hidden md:inline" style={{ color: "var(--color-text-muted)" }}>
            no LLM · no network · no keys
          </span>
          <span className="kbd du-kbd-hint">⌘K</span>
        </div>
      </header>

      {/* Hero — the one BlurText anchor */}
      <section
        className="du-orb-indigo relative overflow-hidden px-6 pb-16 pt-20 text-center lg:pb-20 lg:pt-24"
        style={{ background: "var(--color-bg-accent-glow)" }}
      >
        <p className="text-eyebrow mb-6">Live agent loop · budget caps · safety guards</p>
        <BlurText
          text="Your terminal, with a team inside it."
          delay={110}
          className="text-h1 mx-auto max-w-3xl"
        />
        <p
          className="text-body-lg mx-auto mt-6 max-w-[62ch]"
          style={{ color: "var(--color-text-secondary)" }}
        >
          This is a working demo of an agent that plans, acts, and checks its
          own work. Type a task below and press run: the engine rewrites its
          whole plan every turn while budget caps and safety hooks keep it
          honest. Every number is real, from the engine payload.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <HeroCta />
          <span className="mono text-caption" style={{ color: "var(--color-text-muted)" }}>
            press <span className="kbd du-kbd-hint">⌘K</span> for the command palette
          </span>
        </div>
      </section>

      <Separator />

      {/* App */}
      <section id="app">
        <AppSection />
      </section>

      <Separator />

      {/* Footer */}
      <footer className="px-6 py-8">
        <p className="mono text-caption mx-auto max-w-3xl text-center">
          Engine ported from dev4aibots/agentic-cli-workspace and vendored in
          web/lib/engine · Tokens in DESIGN.md (Linear) · Next.js 14 · No login,
          no keys, no external calls
        </p>
      </footer>
    </div>
  );
}
