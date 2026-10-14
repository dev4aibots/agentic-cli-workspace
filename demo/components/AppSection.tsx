"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import type { BudgetLimits } from "@/lib/result";
import { DEFAULT_BUDGET } from "@/lib/result";
import { Tabs } from "@/components/ui/tabs";
import { RunView, type RunState } from "@/components/RunView";
import { CommandPalette, type PaletteCommand } from "@/components/CommandPalette";
import { BudgetView, EvalView, SafetyView, TraceView, PlanView, INITIAL_EVAL_STATE, INITIAL_SAFETY_STATE, type EvalState, type SafetyState } from "@/components/views";

const TABS: { id: string; label: string; hint?: string }[] = [
  { id: "run", label: "Run a task" },
  { id: "budget", label: "Set limits" },
  { id: "eval", label: "Run the checks" },
  { id: "safety", label: "Test safety" },
  { id: "trace", label: "Read the trace" },
  { id: "plan", label: "Read the plan" },
];

const TAB_LABEL: Record<string, string> = Object.fromEntries(
  TABS.map((t) => [t.id, t.label]),
);

export function AppSection() {
  const [tab, setTab] = React.useState("run");
  const [budget, setBudget] = React.useState<BudgetLimits>({ ...DEFAULT_BUDGET });
  const [run, setRun] = React.useState<RunState | null>(null);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  // BUG-18: eval state lives here (not in EvalView) so results persist
  // across tab switches — the tab component unmounts on navigation.
  const [evalState, setEvalState] = React.useState<EvalState>(INITIAL_EVAL_STATE);
  // QA-2: same treatment for safety-drill results — they used to reset to
  // "No drills fired yet" on every tab switch while eval results persisted.
  const [safetyState, setSafetyState] = React.useState<SafetyState>(INITIAL_SAFETY_STATE);
  // QA-1: the task input lives here (not in RunView) so it survives tab
  // switches instead of resetting to the "summarize README" default.
  const [taskInput, setTaskInput] = React.useState("summarize README");
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const goTo = React.useCallback((id: string) => {
    setTab(id);
    document.getElementById("app")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const focusTaskBox = React.useCallback(() => {
    setTab("run");
    requestAnimationFrame(() => {
      document.getElementById("app")?.scrollIntoView({ block: "start" });
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  }, []);

  // QA-4: the hero "Run your first task" CTA (page.tsx) dispatches this
  // event — switch to the Run tab so the user lands on the right panel,
  // not whichever tab they left open. The anchor itself handles scrolling.
  React.useEffect(() => {
    const onGoRun = () => setTab("run");
    window.addEventListener("demo:go-run", onGoRun);
    return () => window.removeEventListener("demo:go-run", onGoRun);
  }, []);

  // ⌘K / Ctrl+K opens the command palette from anywhere.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const commands: PaletteCommand[] = React.useMemo(
    () => [
      ...TABS.map((t) => ({
        id: `go-${t.id}`,
        group: "Go to" as const,
        label: t.label,
        hint: t.hint,
        run: () => goTo(t.id),
      })),
      {
        id: "focus-task",
        group: "Actions" as const,
        label: "Focus the task box",
        hint: "↵",
        run: focusTaskBox,
      },
      {
        id: "reset-budget",
        group: "Actions" as const,
        label: "Reset limits to defaults",
        run: () => {
          setBudget({ ...DEFAULT_BUDGET });
          goTo("budget");
        },
      },
    ],
    [goTo, focusTaskBox],
  );

  return (
    <div className="flex flex-col gap-0 lg:flex-row">
      <aside
        className="shrink-0 border-b lg:w-60 lg:border-b-0 lg:border-r"
        style={{ borderColor: "var(--color-border-hairline)" }}
        aria-label="Demo sections"
      >
        <div className="p-4 lg:sticky lg:top-0">
          <p className="text-eyebrow mb-3 px-3">Demo</p>
          <Tabs tabs={TABS} active={tab} onChange={setTab} />
          <button
            onClick={() => setPaletteOpen(true)}
            className="mt-3 flex w-full items-center justify-between rounded-md border px-3 py-2 text-left outline-none"
            style={{
              borderColor: "var(--color-border-hairline)",
              color: "var(--color-text-muted)",
              transition: "var(--motion-transition-state)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-bg-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            aria-label="Open command palette"
          >
            <span className="text-body">Search commands…</span>
            <span className="kbd">⌘K</span>
          </button>
          <div
            className="mt-6 rounded-lg border p-3"
            style={{ borderColor: "var(--color-border-hairline)" }}
          >
            <p className="text-caption">Engine</p>
            <p className="mono mt-1 text-body" style={{ color: "var(--color-status-success)" }}>
              ● live · deterministic
            </p>
            <p className="text-caption mt-1">
              Scripted model — no keys, no network calls.
            </p>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-6 lg:p-10" role="tabpanel" aria-label={TAB_LABEL[tab]}>
        <div className="mx-auto max-w-4xl">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
            >
              {tab === "run" && (
                <RunView budget={budget} setBudget={setBudget} run={run} setRun={setRun} task={taskInput} setTask={setTaskInput} inputRef={inputRef} />
              )}
              {tab === "budget" && <BudgetView budget={budget} setBudget={setBudget} run={run} />}
              {tab === "eval" && <EvalView evalState={evalState} setEvalState={setEvalState} />}
              {tab === "safety" && <SafetyView safetyState={safetyState} setSafetyState={setSafetyState} />}
              {tab === "trace" && <TraceView run={run} />}
              {tab === "plan" && <PlanView run={run} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        commands={commands}
      />
    </div>
  );
}
