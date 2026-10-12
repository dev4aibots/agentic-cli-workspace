import { BlurText } from "@/components/BlurText";
import { AppSection } from "@/components/AppSection";
import { Separator } from "@/components/ui/scroll-area";

export default function Page() {
  return (
    <div className="min-h-screen">
      {/* Top nav */}
      <header
        className="flex h-12 items-center justify-between border-b px-6"
        style={{ borderColor: "var(--color-border-hairline)", height: "var(--nav-height)" }}
      >
        <div className="flex items-center gap-3">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-md text-body font-semibold"
            style={{
              background: "var(--color-accent-gradient)",
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
        <span className="mono text-caption">deterministic · offline · zero keys</span>
      </header>

      {/* Hero — the one react-bits anchor (BlurText, hand reimplemented) */}
      <section
        className="relative overflow-hidden px-6 pb-16 pt-20 text-center lg:pb-20 lg:pt-24"
        style={{ background: "var(--color-bg-accent-glow)" }}
      >
        <p className="text-eyebrow mb-6">Scripted agent loop · budget gates · safety hooks</p>
        <BlurText
          text="Command your workspace."
          delay={110}
          className="headline-gradient text-h1 mx-auto max-w-4xl"
        />
        <p
          className="text-body-lg mx-auto mt-6 max-w-2xl"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Watch a plan → act → observe loop run for real: whole-plan rewrites,
          PreToolUse guard rails, a sandbox the file tool cannot escape, and a
          budget that actually stops the run.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <a href="#app" className="btn-primary no-underline">
            Run the agent
          </a>
          <span className="mono text-caption" style={{ color: "var(--color-text-muted)" }}>
            press <span className="kbd">⌘K</span> to focus the command bar
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
        <p className="mono text-caption mx-auto max-w-4xl text-center">
          Engine: port of dev4aibots/agentic-cli-workspace, vendored verbatim in
          web/lib/engine · Design tokens: DESIGN.md (Linear) · Built with
          Next.js 14 + shadcn-style components · No login, no credentials, no
          external calls
        </p>
      </footer>
    </div>
  );
}
