"use client";

import * as React from "react";
import type { BudgetLimits, EngineRunResult, EvalCaseResult } from "@/lib/result";
import { DEFAULT_BUDGET } from "@/lib/result";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/scroll-area";
import { PlanChecklist, Gauge, StopBanner, StatusLine } from "@/components/run-ui";
import { ScrollArea } from "@/components/ui/scroll-area";

/* ---------------- Budget tab ---------------- */
export function BudgetView({
  budget,
  setBudget,
  run,
}: {
  budget: BudgetLimits;
  setBudget: (b: BudgetLimits) => void;
  run: { result: EngineRunResult; revealed: number } | null;
}) {
  const reset = () => setBudget({ ...DEFAULT_BUDGET });
  return (
    <div className="flex flex-col gap-6">
      <div className="card card-glass p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-h3" style={{ color: "var(--color-text-primary)" }}>
              Budget controls
            </h2>
            <p className="text-caption mt-1">
              Overrides are per-call; the engine defaults (50 / 200,000 / $5.00) are
              frozen constants.
            </p>
          </div>
          <Button variant="secondary" onClick={reset}>
            Reset to defaults
          </Button>
        </div>
        <div className="flex flex-col gap-6">
          <Slider label="Max turns" min={1} max={50} value={budget.maxTurns}
            onChange={(v) => setBudget({ ...budget, maxTurns: v })} format={(v) => `${v}`} />
          <Slider label="Max tokens" min={1000} max={200000} step={1000} value={budget.maxTokens}
            onChange={(v) => setBudget({ ...budget, maxTokens: v })} format={(v) => v.toLocaleString()} />
          <Slider label="Max dollars" min={0.05} max={5} step={0.05} value={budget.maxDollars}
            onChange={(v) => setBudget({ ...budget, maxDollars: v })} format={(v) => `$${v.toFixed(2)}`} />
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-title mb-3" style={{ color: "var(--color-text-primary)" }}>
          Stop semantics (engine-verbatim)
        </h3>
        <Separator className="mb-4" />
        <ul className="mono flex flex-col gap-2 text-body" style={{ color: "var(--color-text-secondary)" }}>
          <li><Badge tone="warning">turn_limit</Badge> top-of-loop pre-check · completed=false</li>
          <li><Badge tone="warning">token_limit</Badge> top-of-loop pre-check · completed=false</li>
          <li><Badge tone="warning">dollar_limit</Badge> top-of-loop pre-check · completed=false</li>
          <li><Badge tone="warning">budget</Badge> tripped right after a turn&apos;s budget.step · completed=true</li>
          <li><Badge tone="success">complete</Badge> scripted step with tool: null · completed=true</li>
        </ul>
        <p className="text-caption mt-4">
          Try it: set Max turns to 1 and run — the agent stops after one turn with
          stopReason &quot;budget&quot; (the upstream behavior, asserted by the engine tests).
        </p>
      </div>

      {run?.result && (
        <div className="card p-6">
          <h3 className="text-title mb-3" style={{ color: "var(--color-text-primary)" }}>
            Last run
          </h3>
          <StopBanner reason={run.result.stopReason} passed={run.result.passed} />
          <div className="mt-5 flex flex-col gap-4">
            <Gauge label="Turns" used={run.result.budget.turnsUsed} limit={budget.maxTurns} format={(v) => `${v}`} />
            <Gauge label="Tokens" used={run.result.budget.tokensUsed} limit={budget.maxTokens} format={(v) => v.toLocaleString()} />
            <Gauge label="Dollars" used={run.result.budget.dollarsUsed} limit={budget.maxDollars} format={(v) => `$${v.toFixed(3)}`} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Eval tab ---------------- */
export function EvalView() {
  const [cases, setCases] = React.useState<EvalCaseResult[] | null>(null);
  const [summary, setSummary] = React.useState<{ passed: number; failed: number } | null>(null);
  const [running, setRunning] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const runEval = async () => {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch("/api/eval", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "eval failed");
      setCases(data.cases);
      setSummary({ passed: data.passed, failed: data.failed });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="card card-glass p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-h3" style={{ color: "var(--color-text-primary)" }}>
              Eval suite
            </h2>
            <p className="text-caption mt-1">
              The engine&apos;s verbatim EVAL_TASKS. Pass rule: passed &amp;&amp;
              doneCount ≥ expectedDone.
            </p>
          </div>
          <Button variant="primary" onClick={runEval} disabled={running}>
            {running ? "Evaluating…" : "Run eval"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border px-4 py-3" role="alert"
          style={{ borderColor: "var(--color-status-danger)" }}>
          <span className="mono text-body" style={{ color: "var(--color-status-danger)" }}>{error}</span>
        </div>
      )}

      {summary && (
        <div className="flex items-center gap-3">
          <Badge tone={summary.failed === 0 ? "success" : "danger"}>
            {summary.passed} passed
          </Badge>
          {summary.failed > 0 && <Badge tone="danger">{summary.failed} failed</Badge>}
          <span className="text-caption">{cases?.length ?? 0} cases · engine-verbatim pass rule</span>
        </div>
      )}

      {cases && (
        <div className="flex flex-col gap-3">
          {cases.map((c) => (
            <div key={c.task} className="card p-5">
              <div className="flex items-center gap-3">
                <span
                  className="mono flex h-7 w-7 items-center justify-center rounded-md text-body"
                  style={{
                    border: "1px solid var(--color-border-hairline)",
                    color: c.passed ? "var(--color-status-success)" : "var(--color-status-danger)",
                  }}
                >
                  {c.passed ? "✓" : "✗"}
                </span>
                <code className="mono text-body" style={{ color: "var(--color-text-primary)" }}>
                  {c.task}
                </code>
                <span className="ml-auto">
                  <Badge tone={c.passed ? "success" : "danger"}>
                    {c.passed ? "pass" : "fail"}
                  </Badge>
                </span>
              </div>
              <Separator className="my-3" />
              <div className="mono-nums flex flex-wrap gap-x-6 gap-y-1 text-body"
                style={{ color: "var(--color-text-secondary)" }}>
                <span>done <b style={{ color: "var(--color-text-primary)" }}>{c.doneCount}</b> / expected {c.expectedDone}</span>
                <span>turns {c.turns}</span>
                <span>stop <b style={{ color: "var(--color-text-primary)" }}>{c.stopReason}</b></span>
                <span>{c.tokensUsed.toLocaleString()} tokens</span>
                <span>${c.dollarsUsed.toFixed(3)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!cases && !running && (
        <StatusLine text="No eval run yet — press “Run eval”." />
      )}
    </div>
  );
}

/* ---------------- Safety tab ---------------- */
type SafetyResult =
  | { probe: "destructive"; tool: string; args: Record<string, string>; blocked: boolean; blockReason: string | null; shellSpawned: boolean }
  | { probe: "escape"; tool: string; args: Record<string, string>; output: string | null; error: string | null; escaped: boolean }
  | { probe: "safe"; tool: string; args: Record<string, string>; blocked: boolean };

export function SafetyView() {
  const [results, setResults] = React.useState<SafetyResult[]>([]);
  const [busy, setBusy] = React.useState<string | null>(null);

  const probe = async (name: "destructive" | "escape" | "safe") => {
    setBusy(name);
    try {
      const res = await fetch("/api/safety", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ probe: name }),
      });
      const data = (await res.json()) as SafetyResult;
      setResults((r) => [data, ...r].slice(0, 6));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="card card-glass p-6">
        <h2 className="text-h3" style={{ color: "var(--color-text-primary)" }}>
          Safety playground
        </h2>
        <p className="text-caption mt-1 max-w-2xl">
          These probes call the <em>real</em> engine guard and the{" "}
          <em>real</em> sandboxed file tool — not simulations. No shell is ever
          spawned; the destructive guard fires inside the PreToolUse hook.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => probe("destructive")} disabled={busy !== null}>
            {busy === "destructive" ? "Probing…" : 'Attempt rm -rf /tmp/test'}
          </Button>
          <Button variant="secondary" onClick={() => probe("escape")} disabled={busy !== null}>
            {busy === "escape" ? "Probing…" : "Attempt ../escape read"}
          </Button>
          <Button variant="ghost" onClick={() => probe("safe")} disabled={busy !== null}>
            {busy === "safe" ? "Probing…" : "Benign ls (control)"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {results.map((r, i) => (
          <div key={i} className="card p-5">
            <div className="flex items-center gap-3">
              <Badge tone={r.probe === "safe" ? "info" : "warning"}>{r.probe}</Badge>
              <code className="mono text-body" style={{ color: "var(--color-text-primary)" }}>
                {r.tool} {Object.entries(r.args).map(([k, v]) => `${k}="${v}"`).join(" ")}
              </code>
              <span className="ml-auto">
                {r.probe === "destructive" && (
                  <Badge tone={r.blocked ? "success" : "danger"}>
                    {r.blocked ? "blocked by PreToolUse guard" : "NOT BLOCKED"}
                  </Badge>
                )}
                {r.probe === "escape" && (
                  <Badge tone={r.escaped ? "danger" : "success"}>
                    {r.escaped ? "escaped sandbox" : "containment held"}
                  </Badge>
                )}
                {r.probe === "safe" && (
                  <Badge tone={r.blocked ? "warning" : "success"}>
                    {r.blocked ? "blocked (unexpected)" : "allowed"}
                  </Badge>
                )}
              </span>
            </div>
            <Separator className="my-3" />
            <div className="mono flex flex-col gap-1 text-body" style={{ color: "var(--color-text-secondary)" }}>
              {r.probe === "destructive" && (
                <>
                  <span>blockReason: <b style={{ color: "var(--color-status-warning)" }}>{r.blockReason ?? "—"}</b></span>
                  <span>shellSpawned: <b style={{ color: "var(--color-status-success)" }}>{String(r.shellSpawned)}</b></span>
                </>
              )}
              {r.probe === "escape" && (
                r.error
                  ? <span>thrown: <b style={{ color: "var(--color-status-danger)" }}>{r.error}</b></span>
                  : <span>output preview: <b>{r.output?.slice(0, 120)}</b></span>
              )}
              {r.probe === "safe" && <span>destructiveGuard returned the payload unblocked.</span>}
            </div>
          </div>
        ))}
        {results.length === 0 && (
          <StatusLine text="No probes yet — fire one above. The guard patterns are the engine's frozen blocklist: /\brm\s+-rf\b/ and /\bshutdown\b/." />
        )}
      </div>
    </div>
  );
}

/* ---------------- Trace tab ---------------- */
export function TraceView({ run }: { run: { result: EngineRunResult } | null }) {
  const result = run?.result;
  if (!result)
    return (
      <div className="card p-6">
        <h2 className="text-h3 mb-2" style={{ color: "var(--color-text-primary)" }}>
          Trace timeline
        </h2>
        <StatusLine text="Run the agent first — the full hook-event log will appear here." />
      </div>
    );
  return (
    <div className="flex flex-col gap-6">
      <div className="card card-glass p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-h3" style={{ color: "var(--color-text-primary)" }}>
            Trace timeline
          </h2>
          <Badge tone="accent">{result.trace.length} events</Badge>
        </div>
        <p className="text-caption mt-1">
          Raw HookPayload log from the engine, verbatim. Budget snapshot at
          SessionEnd included.
        </p>
      </div>
      <ScrollArea className="card max-h-[560px] p-5">
        <ol className="flex flex-col gap-2">
          {result.trace.map((p, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mono-nums text-caption w-8 shrink-0 pt-0.5"
                style={{ color: "var(--color-text-muted)" }}>
                {String(i).padStart(2, "0")}
              </span>
              <Badge tone={
                p.event === "stop" ? (p.reason === "complete" ? "success" : "warning")
                : p.event === "start" || p.event === "end" ? "info"
                : p.blocked ? "warning"
                : "muted"
              }>
                {String(p.event)}
              </Badge>
              <pre className="mono flex-1 overflow-x-auto whitespace-pre-wrap text-body"
                style={{ color: "var(--color-text-secondary)" }}>
                {JSON.stringify(p, null, 1)}
              </pre>
            </li>
          ))}
        </ol>
      </ScrollArea>
    </div>
  );
}

/* ---------------- Plan tab ---------------- */
export function PlanView({ run }: { run: { result: EngineRunResult } | null }) {
  const result = run?.result;
  if (!result)
    return (
      <div className="card p-6">
        <h2 className="text-h3 mb-2" style={{ color: "var(--color-text-primary)" }}>
          Plan inspector
        </h2>
        <StatusLine text="Run the agent first — per-turn plan snapshots will appear here." />
      </div>
    );
  return (
    <div className="flex flex-col gap-6">
      <div className="card card-glass p-6">
        <h2 className="text-h3" style={{ color: "var(--color-text-primary)" }}>
          Plan inspector
        </h2>
        <p className="text-caption mt-1 max-w-2xl">
          The engine rewrites the <em>whole plan</em> every turn (PlanState.rewrite)
          — no partial updates. Each snapshot below is plan.summary() after that
          turn&apos;s rewrite.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {result.turns.map((t, i) => (
          <div key={t.turn} className="card p-5">
            <div className="mb-3 flex items-center gap-3">
              <Badge tone="accent">turn {t.turn}</Badge>
              <span className="text-caption">
                snapshot {i + 1} / {result.planSnapshots.length}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <p className="text-eyebrow mb-2">summary() output</p>
                <pre className="mono whitespace-pre-wrap rounded-md border p-3 text-body"
                  style={{
                    borderColor: "var(--color-border-hairline)",
                    color: "var(--color-text-secondary)",
                    background: "var(--color-bg-page)",
                  }}>
                  {result.planSnapshots[i]}
                </pre>
              </div>
              <div>
                <p className="text-eyebrow mb-2">structured items</p>
                <PlanChecklist items={t.plan} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
