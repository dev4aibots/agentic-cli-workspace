"use client";

import * as React from "react";
import { motion } from "motion/react";
import type { EngineRunResult, TodoItem } from "@/lib/result";
import { STATUS_MARK, STATUS_TONE } from "@/lib/result";
import { Badge } from "@/components/ui/badge";

/** Live plan checklist: [ ] pending / [>] in_progress / [x] done / [!] failed */
export function PlanChecklist({ items }: { items: TodoItem[] }) {
  if (items.length === 0)
    return (
      <p className="text-caption">No plan items yet. The agent has not started.</p>
    );
  return (
    <ul className="flex flex-col gap-1">
      {items.map((it) => (
        <li
          key={it.id}
          className="flex items-center gap-3 rounded-md px-2 py-1.5"
          style={{ transition: "var(--motion-transition-state)" }}
        >
          <span
            className="mono flex h-6 w-6 items-center justify-center rounded-md text-body font-medium"
            style={{
              border: "1px solid var(--color-border-hairline)",
              color:
                it.status === "done"
                  ? "var(--color-status-success)"
                  : it.status === "in_progress"
                    ? "var(--color-status-info)"
                    : "var(--color-text-muted)",
              background:
                it.status === "in_progress" ? "var(--color-bg-active)" : "transparent",
            }}
            aria-label={it.status.replace("_", " ")}
          >
            {STATUS_MARK[it.status]}
          </span>
          <span
            className="text-body"
            style={{
              color:
                it.status === "done"
                  ? "var(--color-text-muted)"
                  : "var(--color-text-primary)",
              textDecoration: it.status === "done" ? "line-through" : "none",
            }}
          >
            {it.description}
          </span>
          <Badge tone={STATUS_TONE[it.status]} className="ml-auto">
            {it.status.replace("_", " ")}
          </Badge>
        </li>
      ))}
    </ul>
  );
}

/** One turn: tool-call card with zod-validated args, output, bytes. */
export function TurnCard({
  turn,
  active = false,
}: {
  turn: EngineRunResult["turns"][number];
  active?: boolean;
}) {
  const [open, setOpen] = React.useState(true);
  const r = turn.toolResult;
  const duStatus = r?.blocked
    ? "warning"
    : r?.ok
      ? "success"
      : r
        ? "danger"
        : "info";
  return (
    <div
      className={`card du-status-rail overflow-hidden${active ? " du-beam-active" : ""}`}
      data-du-status={duStatus}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left outline-none"
        style={{ transition: "var(--motion-transition-state)" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-bg-hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <span
          className="mono-nums text-label"
          style={{ color: "var(--color-text-muted)" }}
        >
          {String(turn.turn).padStart(2, "0")}
        </span>
        {turn.tool ? (
          <code className="mono text-body" style={{ color: "var(--color-text-primary)" }}>
            {turn.tool.name}
            <span style={{ color: "var(--color-text-muted)" }}>
              {" "}
              {Object.entries(turn.tool.args)
                .map(([k, v]) => `${k}="${v}"`)
                .join(" ")}
            </span>
          </code>
        ) : (
          <span className="text-body" style={{ color: "var(--color-text-muted)" }}>
            no tool call: the script finished here
          </span>
        )}
        <span className="ml-auto flex items-center gap-2">
          {r && (
            <Badge
              tone={r.blocked ? "warning" : r.ok ? "success" : "danger"}
            >
              {r.blocked ? "blocked" : r.ok ? "ok" : "error"}
            </Badge>
          )}
          <span className="mono-nums text-caption">
            {turn.tokens.toLocaleString()} tok · ${turn.cost.toFixed(3)}
          </span>
          <span style={{ color: "var(--color-text-muted)" }}>{open ? "−" : "+"}</span>
        </span>
      </button>
      {open && r && (
        <div
          className="border-t px-4 py-3"
          style={{ borderColor: "var(--color-border-hairline)" }}
        >
          {r.blocked && (
            <p className="mono text-body" style={{ color: "var(--color-status-warning)" }}>
              blocked: {r.reason}
            </p>
          )}
          {r.error && (
            <p className="mono text-body" style={{ color: "var(--color-status-danger)" }}>
              error: {r.error}
            </p>
          )}
          {r.ok && (
            <p className="mono text-body" style={{ color: "var(--color-status-success)" }}>
              ok — {r.bytes?.toLocaleString() ?? 0} bytes returned
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/** Budget gauge: used vs limit, mono numerals. */
export function Gauge({
  label,
  used,
  limit,
  format,
}: {
  label: string;
  used: number;
  limit: number;
  format: (v: number) => string;
}) {
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const hot = pct >= 90;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-label" style={{ color: "var(--color-text-muted)" }}>
          {label}
        </span>
        <span
          className="mono-nums text-body"
          style={{ color: hot ? "var(--color-status-warning)" : "var(--color-text-primary)" }}
        >
          {format(used)} / {format(limit)}
        </span>
      </div>
      <div
        className="h-1 w-full overflow-hidden rounded-pill"
        style={{ background: "var(--color-border-hairline)" }}
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label} budget usage`}
      >
        <div
          className="h-full rounded-pill"
          style={{
            width: `${pct}%`,
            background: hot ? "var(--color-status-warning)" : "var(--color-accent)",
            transition: "width var(--motion-duration-short) var(--motion-easing)",
          }}
        />
      </div>
    </div>
  );
}

/** Honest stop-reason banner, rendered from the payload. */
export function StopBanner({ reason, passed }: { reason: string; passed: boolean }) {
  const tone: Record<string, "success" | "warning" | "danger" | "info" | "muted"> = {
    complete: "success",
    turn_limit: "warning",
    token_limit: "warning",
    dollar_limit: "warning",
    budget: "warning",
  };
  const copy: Record<string, string> = {
    complete: "Done. The scripted model finished its plan.",
    turn_limit: "Stopped: the turn limit hit before the plan finished.",
    token_limit: "Stopped: the token budget ran out.",
    dollar_limit: "Stopped: the dollar budget ran out.",
    budget: "Stopped: a turn spent past a budget cap (engine semantics).",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
      className="flex items-center gap-3 rounded-lg border px-4 py-3"
      style={{
        borderColor: "var(--color-border-hairline)",
        background: "var(--color-bg-surface)",
      }}
      role="status"
    >
      <Badge tone={tone[reason] ?? "muted"}>{reason || "unknown"}</Badge>
      <span className="text-body" style={{ color: "var(--color-text-secondary)" }}>
        {copy[reason] ?? "Stop reason not recognized."}
      </span>
      <span className="ml-auto">
        <Badge tone={passed ? "success" : "danger"}>
          {passed ? "passed" : "not passed"}
        </Badge>
      </span>
    </motion.div>
  );
}

export function StatusLine({ text }: { text: string }) {
  return (
    <p className="mono text-caption" style={{ color: "var(--color-text-muted)" }}>
      {text}
    </p>
  );
}
