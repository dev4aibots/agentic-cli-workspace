"use client";

import * as React from "react";
import { motion } from "motion/react";
import type {
  BudgetLimits,
  EngineRunResult,
} from "@/lib/result";
import { DEFAULT_BUDGET } from "@/lib/result";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/scroll-area";
import { PlanChecklist, TurnCard, Gauge, StopBanner } from "@/components/run-ui";

const REVEAL_MS = 850;

export type RunState = {
  result: EngineRunResult;
  revealed: number; // turns revealed so far
  running: boolean;
  // QA-1: the task label frozen at run start. The run summary must read the
  // label from the run record — never from the (remountable) input state —
  // or a completed run gets mislabeled after a tab switch.
  task: string;
};

export function RunView({
  budget,
  setBudget,
  run,
  setRun,
  task,
  setTask,
  inputRef,
}: {
  budget: BudgetLimits;
  setBudget: (b: BudgetLimits) => void;
  run: RunState | null;
  setRun: React.Dispatch<React.SetStateAction<RunState | null>>;
  task: string;
  setTask: (t: string) => void;
  inputRef: React.Ref<HTMLInputElement>;
}) {
  const [error, setError] = React.useState<string | null>(null);
  const timer = React.useRef<ReturnType<typeof setInterval> | null>(null);

  React.useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );

  const startRun = async () => {
    if (timer.current) clearInterval(timer.current);
    setError(null);
    setRun({ result: null as unknown as EngineRunResult, revealed: 0, running: true, task });
    let res: Response;
    try {
      res = await fetch("/api/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ task, budget }),
      });
    } catch (e) {
      setRun(null);
      setError(
        `The run could not start: the request failed: ${(e as Error).message}. Check your connection and press “Run the task” again.`,
      );
      return;
    }
    const data = await res.json();
    if (!res.ok) {
      setRun(null);
      setError(
        `The run could not start: the server rejected the task: ${data.error ?? "run failed"}. Fix the task text and try again.`,
      );
      return;
    }
    const result = data as EngineRunResult;
    setRun({ result, revealed: 0, running: true, task });
    const total = result.turns.length;
    timer.current = setInterval(() => {
      setRun((prev) => {
        if (!prev) return prev;
        const next = Math.min(total, prev.revealed + 1);
        if (next >= total && timer.current) {
          clearInterval(timer.current);
          timer.current = null;
        }
        return { ...prev, revealed: next, running: next < total };
      });
    }, REVEAL_MS);
  };

  const result = run?.result ?? null;
  const revealed = run?.revealed ?? 0;
  const running = run?.running ?? false;
  const shownTurns = result ? result.turns.slice(0, revealed) : [];
  const latestPlan = shownTurns.length
    ? shownTurns[shownTurns.length - 1].plan
    : [];
  const final = result && revealed >= result.turns.length;
  const liveBudget = shownTurns.length
    ? shownTurns[shownTurns.length - 1].budgetAfter
    : { turnsUsed: 0, tokensUsed: 0, dollarsUsed: 0 };

  // Live hook-event feed derived from the payload (SessionStart + per-turn
  // PreToolUse/PostToolUse + Stop/SessionEnd), revealed in step with turns.
  const events: { label: string; detail: string; tone: "muted" | "info" | "success" | "warning" | "danger" }[] = [];
  if (result) {
    // QA-1: label comes from the frozen run record, not the input state.
    events.push({ label: "SessionStart", detail: `task="${run?.task ?? task}"`, tone: "info" });
    shownTurns.forEach((t, i) => {
      if (t.tool) {
        events.push({
          label: "PreToolUse",
          detail: `${t.tool.name} · destructiveGuard → ${
            t.toolResult?.blocked ? "BLOCKED" : "allowed"
          }`,
          tone: t.toolResult?.blocked ? "warning" : "muted",
        });
      }
      events.push({
        label: "PostToolUse",
        // BUG-19: on budget-stopped runs the final turn's tool is never
        // dispatched, so toolResult is null and `error: ${undefined}` would
        // leak into the UI. Render the error segment only when defined.
        detail: t.tool
          ? `${t.tool.name} → ${
              t.toolResult?.blocked
                ? `blocked: ${t.toolResult.reason}`
                : t.toolResult?.ok
                  ? `ok · ${t.toolResult.bytes?.toLocaleString()} bytes`
                  : t.toolResult?.error !== undefined
                    ? `error: ${t.toolResult.error}`
                    : "not dispatched (run stopped before the tool call)"
            }`
          : "no tool call (model step with tool: null)",
        tone: t.toolResult?.blocked
          ? "warning"
          : t.toolResult?.ok || !t.tool
            ? "success"
            : "danger",
      });
      void i;
    });
    if (final) {
      events.push({
        label: "Stop",
        detail: `reason="${result.stopReason}"`,
        tone: result.stopReason === "complete" ? "success" : "warning",
      });
      events.push({ label: "SessionEnd", detail: "budget snapshot", tone: "muted" });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Command bar: the terminal prompt */}
      <div className="term p-4">
        <label
          htmlFor="task-input"
          className="text-eyebrow mb-3 block"
        >
          Task for the agent
        </label>
        <div className="flex items-center gap-3">
          <span className="mono text-body" style={{ color: "var(--color-accent)" }} aria-hidden="true">
            $
          </span>
          <Input
            id="task-input"
            ref={inputRef}
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !running) startRun();
            }}
            placeholder="summarize README"
            disabled={running}
            className="mono"
            spellCheck={false}
          />
          <Button
            variant="primary"
            onClick={startRun}
            disabled={running || task.trim().length === 0}
          >
            {running ? "Running…" : "Run the task"}
          </Button>
        </div>
        <p className="text-caption mt-3 max-w-[68ch]">
          The engine runs the same scripted 3-step plan for any task you type
          (only the label changes). No LLM, no network, no API keys — every
          number below comes from the real engine payload.
        </p>
      </div>

      {/* Budget sliders */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Slider
          label="Max turns"
          min={1}
          max={50}
          value={budget.maxTurns}
          onChange={(v) => setBudget({ ...budget, maxTurns: v })}
          format={(v) => `${v}`}
          disabled={running}
        />
        <Slider
          label="Max tokens"
          min={1000}
          max={200000}
          step={1000}
          value={budget.maxTokens}
          onChange={(v) => setBudget({ ...budget, maxTokens: v })}
          format={(v) => v.toLocaleString()}
          disabled={running}
        />
        <Slider
          label="Max dollars"
          min={0.05}
          max={5}
          step={0.05}
          value={budget.maxDollars}
          onChange={(v) => setBudget({ ...budget, maxDollars: v })}
          format={(v) => `$${v.toFixed(2)}`}
          disabled={running}
        />
      </div>

      {error && (
        <div
          className="rounded-lg border px-4 py-3"
          style={{
            borderColor: "var(--color-status-danger)",
            background: "color-mix(in srgb, var(--color-status-danger) 8%, transparent)",
          }}
          role="alert"
        >
          <span className="mono text-body" style={{ color: "var(--color-status-danger)" }}>
            {error}
          </span>
        </div>
      )}

      {result && (
        <>
          {final && <StopBanner reason={result.stopReason} passed={result.passed} />}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Live plan checklist */}
            <div className="card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-title" style={{ color: "var(--color-text-primary)" }}>
                  Plan
                </h3>
                <Badge tone="accent">rewritten every turn · turn {revealed}</Badge>
              </div>
              <Separator className="mb-3" />
              <PlanChecklist items={latestPlan} />
            </div>

            {/* Live gauges */}
            <div className="card flex flex-col gap-5 p-5">
              <h3 className="text-title" style={{ color: "var(--color-text-primary)" }}>
                Spending so far
              </h3>
              <Separator />
              <Gauge
                label="Turns"
                used={liveBudget.turnsUsed}
                limit={result.budgetSnapshot.maxTurns}
                format={(v) => `${v}`}
              />
              <Gauge
                label="Tokens"
                used={liveBudget.tokensUsed}
                limit={result.budgetSnapshot.maxTokens}
                format={(v) => v.toLocaleString()}
              />
              <Gauge
                label="Dollars"
                used={liveBudget.dollarsUsed}
                limit={result.budgetSnapshot.maxDollars}
                format={(v) => `$${v.toFixed(3)}`}
              />
              <p className="text-caption mt-auto">
                Engine defaults: {DEFAULT_BUDGET.maxTurns} turns /{" "}
                {DEFAULT_BUDGET.maxTokens.toLocaleString()} tokens / $
                {DEFAULT_BUDGET.maxDollars.toFixed(2)}, fixed in the engine, not the UI.
              </p>
            </div>
          </div>

          {/* Turn cards */}
          <div className="flex flex-col gap-3">
            <h3 className="text-title" style={{ color: "var(--color-text-primary)" }}>
              Turns <span className="text-caption">({revealed}/{result.turns.length})</span>
            </h3>
            {shownTurns.map((t) => (
              <motion.div
                key={t.turn}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
              >
                <TurnCard turn={t} />
              </motion.div>
            ))}
            {running && (
              <p className="mono text-caption" style={{ color: "var(--color-accent-highlight)" }} aria-live="polite">
                ▍ agent thinking…
              </p>
            )}
          </div>

          {/* Hook event feed */}
          <div className="card p-5">
            <h3 className="text-title mb-3" style={{ color: "var(--color-text-primary)" }}>
              Hook events
            </h3>
            <Separator className="mb-3" />
            <ul className="flex flex-col gap-1.5">
              {events.map((e, i) => (
                <li key={i} className="flex items-baseline gap-3">
                  <span
                    className="mono-nums text-caption w-8 shrink-0"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {String(i).padStart(2, "0")}
                  </span>
                  <Badge tone={e.tone}>{e.label}</Badge>
                  <span className="mono text-body" style={{ color: "var(--color-text-secondary)" }}>
                    {e.detail}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
