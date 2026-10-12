"use client";

import * as React from "react";
import type { BudgetLimits } from "@/lib/result";
import { DEFAULT_BUDGET } from "@/lib/result";
import { Tabs } from "@/components/ui/tabs";
import { RunView, type RunState } from "@/components/RunView";
import { BudgetView, EvalView, SafetyView, TraceView, PlanView, INITIAL_EVAL_STATE, type EvalState } from "@/components/views";

const TABS = [
  { id: "run", label: "Task runner", hint: "⌘K" },
  { id: "budget", label: "Budget" },
  { id: "eval", label: "Eval suite" },
  { id: "safety", label: "Safety playground" },
  { id: "trace", label: "Trace timeline" },
  { id: "plan", label: "Plan inspector" },
];

export function AppSection() {
  const [tab, setTab] = React.useState("run");
  const [budget, setBudget] = React.useState<BudgetLimits>({ ...DEFAULT_BUDGET });
  const [run, setRun] = React.useState<RunState | null>(null);
  // BUG-18: eval state lives here (not in EvalView) so results persist
  // across tab switches — the tab component unmounts on navigation.
  const [evalState, setEvalState] = React.useState<EvalState>(INITIAL_EVAL_STATE);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setTab("run");
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex flex-col gap-0 lg:flex-row">
      <aside
        className="shrink-0 border-b lg:w-60 lg:border-b-0 lg:border-r"
        style={{ borderColor: "var(--color-border-hairline)" }}
        aria-label="Demo navigation"
      >
        <div className="p-4 lg:sticky lg:top-0">
          <p className="text-eyebrow mb-3 px-3">Demo</p>
          <Tabs tabs={TABS} active={tab} onChange={setTab} />
          <div
            className="mt-6 rounded-lg border p-3"
            style={{ borderColor: "var(--color-border-hairline)" }}
          >
            <p className="text-caption">Engine status</p>
            <p className="mono mt-1 text-body" style={{ color: "var(--color-status-success)" }}>
              ● live · deterministic
            </p>
            <p className="text-caption mt-1">No LLM · no network · no keys</p>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-6 lg:p-10" role="tabpanel">
        <div className="mx-auto max-w-4xl">
          {tab === "run" && (
            <RunView budget={budget} setBudget={setBudget} run={run} setRun={setRun} inputRef={inputRef} />
          )}
          {tab === "budget" && <BudgetView budget={budget} setBudget={setBudget} run={run} />}
          {tab === "eval" && <EvalView evalState={evalState} setEvalState={setEvalState} />}
          {tab === "safety" && <SafetyView />}
          {tab === "trace" && <TraceView run={run} />}
          {tab === "plan" && <PlanView run={run} />}
        </div>
      </main>
    </div>
  );
}
