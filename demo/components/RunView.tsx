"use client";

import * as React from "react";
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
};

export function RunView({
  budget,
  setBudget,
  run,
  setRun,
  inputRef,
}: {
  budget: BudgetLimits;
  setBudget: (b: BudgetLimits) => void;
  run: RunState | null;
  setRun: React.Dispatch<React.SetStateAction<RunState | null>>;
  inputRef: React.Ref<HTMLInputElement>;
}) {
  const [task, setTask] = React.useState("summarize README");
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
    setRun({ result: null as unknown as EngineRunResult, revealed: 0, running: true });
    let res: Response;
    try {
      res = await fetch("/api/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ task, budget }),
      });
    } catch (e) {
      setRun(null);
      setError(`request failed: ${(e as Error).message}`);
      return;
    }
    const data = await res.json();
    if (!res.ok) {
      setRun(null);
      setError(data.error ?? "run failed");
      return;
    }
    const result = data as EngineRunResult;
    setRun({ result, revealed: 0, running: true });
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
    events.push({ label: "SessionStart", detail: `task="${task}"`, tone: "info" });
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
        detail: t.tool
          ? `${t.tool.name} → ${
              t.toolResult?.blocked
                ? `blocked: ${t.toolResult.reason}`
                : t.toolResult?.ok
                  ? `ok · ${t.toolResult.bytes?.toLocaleString()} bytes`
                  : `error: ${t.toolResult?.error}`
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
      {/* Command bar */}
      <div
        className="card card-glass p-4"
        style={{ borderRadius: "var(--radius-card)" }}
      >
        <label
          htmlFor="task-input"
          className="text-eyebrow mb-3 block"
        >
          Task
        </label>
        <div className="flex items-center gap-3">
          <span className="mono text-body" style={{ color: "var(--color-accent)" }}>
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
          <span className="kbd hidden sm:inline-block">⌘K</span>
          <Button
            variant="primary"
            onClick={startRun}
            disabled={running || task.trim().length === 0}
          >
            {running ? "Running…" : "Run agent"}
          </Button>
        </div>
        <p className="text-caption mt-3">
          Deterministic scripted model — no LLM, no network, no API keys. Every
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
                <Badge tone="accent">whole-plan rewrite · turn {revealed}</Badge>
              </div>
              <Separator className="mb-3" />
              <PlanChecklist items={latestPlan} />
            </div>

            {/* Live gauges */}
            <div className="card flex flex-col gap-5 p-5">
              <h3 className="text-title" style={{ color: "var(--color-text-primary)" }}>
                Budget
              </h3>
              <Separator />
              <Gauge
                label="Turns"
                used={liveBudget.turnsUsed}
                limit={budget.maxTurns}
                format={(v) => `${v}`}
              />
              <Gauge
                label="Tokens"
                used={liveBudget.tokensUsed}
                limit={budget.maxTokens}
                format={(v) => v.toLocaleString()}
              />
              <Gauge
                label="Dollars"
                used={liveBudget.dollarsUsed}
                limit={budget.maxDollars}
                format={(v) => `$${v.toFixed(3)}`}
              />
              <p className="text-caption mt-auto">
                Defaults {DEFAULT_BUDGET.maxTurns} /{" "}
                {DEFAULT_BUDGET.maxTokens.toLocaleString()} / $
                {DEFAULT_BUDGET.maxDollars.toFixed(2)} — frozen engine constants.
              </p>
            </div>
          </div>

          {/* Turn cards */}
          <div className="flex flex-col gap-3">
            <h3 className="text-title" style={{ color: "var(--color-text-primary)" }}>
              Turns <span className="text-caption">({revealed}/{result.turns.length})</span>
            </h3>
            {shownTurns.map((t) => (
              <TurnCard key={t.turn} turn={t} />
            ))}
            {running && (
              <p className="mono text-caption" style={{ color: "var(--color-accent-highlight)" }}>
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
