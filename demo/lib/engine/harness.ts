// Adapted from upstream src/harness.ts (dev4aibots/agentic-cli-workspace).
//
// The loop is faithful to upstream:
//   plan rewrite (whole) -> budget.step -> PreToolUse destructiveGuard ->
//   tool dispatch (TOOLS) -> PostToolUse trace -> stop reasons.
// Stop-reason semantics are preserved exactly:
//   top-of-loop budget.exceeded() fires Stop {reason: "turn_limit"|"token_limit"|"dollar_limit"} (completed=false)
//   post-step budget.exceeded()   fires Stop {reason: "budget"}            (completed=true)
//   step.tool === null            fires Stop {reason: "complete"}          (completed=true)
//   passed = completed && every plan item is "done".
//
// Adaptations (serverless/UI, see engine/README.md):
//   - async runAgent(task, sandboxDir, budgetOverrides) returning structured
//     per-turn records + planSnapshots + stopReason (no process.exit, no TTY).
//   - Budget defaults remain 50 / 200000 / 5.00; budgetOverrides are per-call
//     (for UI sliders) and reject negative/non-finite values with RangeError.
import { Budget, PlanState } from "./plan";
import { HookBus, destructiveGuard } from "./hooks";
import { ScriptedModel } from "./model";
import { TOOLS } from "./tools";
import type {
  BudgetSnapshot,
  HookPayload,
  RunResult,
  TodoItem,
  ToolCall,
} from "./types";

export type BudgetOverrides = {
  maxTurns?: number;
  maxTokens?: number;
  maxDollars?: number;
};

export type ToolResult = {
  ok: boolean;
  blocked?: boolean;
  reason?: string;
  error?: string;
  bytes?: number;
};

export type TurnRecord = {
  turn: number;
  plan: TodoItem[];
  tool: ToolCall | null;
  tokens: number;
  cost: number;
  toolResult: ToolResult | null;
  budgetAfter: BudgetSnapshot;
};

export type EngineRunResult = RunResult & {
  turns: TurnRecord[];
  planSnapshots: string[];
  stopReason: string;
};

function applyBudgetOverrides(budget: Budget, overrides: BudgetOverrides): void {
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) continue;
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      throw new RangeError(
        `budgetOverrides.${key} must be a non-negative finite number`,
      );
    }
  }
  if (overrides.maxTurns !== undefined) budget.maxTurns = overrides.maxTurns;
  if (overrides.maxTokens !== undefined) budget.maxTokens = overrides.maxTokens;
  if (overrides.maxDollars !== undefined)
    budget.maxDollars = overrides.maxDollars;
}

export async function runAgent(
  task: string,
  sandboxDir: string,
  budgetOverrides: BudgetOverrides = {},
): Promise<EngineRunResult> {
  const plan = new PlanState(task);
  const budget = new Budget();
  applyBudgetOverrides(budget, budgetOverrides);
  const hooks = new HookBus();
  const trace: HookPayload[] = [];
  const turns: TurnRecord[] = [];
  const planSnapshots: string[] = [];
  const model = new ScriptedModel();
  let stopReason = "";

  hooks.on("PreToolUse", destructiveGuard);
  hooks.on("PostToolUse", (p) => {
    trace.push({ event: "tool", ...p });
    return p;
  });
  hooks.on("SessionStart", (p) => {
    trace.push({ event: "start", ...p });
    return p;
  });
  hooks.on("SessionEnd", (p) => {
    trace.push({ event: "end", ...p });
    return p;
  });
  hooks.on("Stop", (p) => {
    stopReason = String(p.reason ?? "");
    trace.push({ event: "stop", ...p });
    return p;
  });

  hooks.fire("SessionStart", { task, sandbox: sandboxDir, startedAt: Date.now() });

  let turn = 0;
  let completed = false;
  while (true) {
    const limit = budget.exceeded();
    if (limit) {
      hooks.fire("Stop", { reason: limit, turn });
      break;
    }
    const step = model.step(plan, turn);
    plan.rewrite(step.plan);
    budget.step(step.tokens, step.cost);
    planSnapshots.push(plan.summary());

    const record: TurnRecord = {
      turn,
      plan: plan.items.map((it) => ({ ...it })),
      tool: step.tool,
      tokens: step.tokens,
      cost: step.cost,
      toolResult: null,
      budgetAfter: budget.snapshot(),
    };
    turns.push(record);

    const postStepLimit = budget.exceeded();
    if (postStepLimit) {
      hooks.fire("Stop", { reason: "budget", turn });
      completed = true;
      break;
    }

    if (step.tool === null) {
      hooks.fire("Stop", { reason: "complete", turn });
      completed = true;
      break;
    }

    const { name, args } = step.tool;
    const pre = hooks.fire("PreToolUse", { tool: name, args });
    if (pre.blocked) {
      record.toolResult = {
        ok: false,
        blocked: true,
        reason: String(pre.reason ?? ""),
      };
      hooks.fire("PostToolUse", {
        tool: name,
        blocked: true,
        reason: String(pre.reason ?? ""),
      });
      turn += 1;
      continue;
    }

    try {
      const result = TOOLS[name](sandboxDir, args);
      record.toolResult = { ok: true, bytes: result.length };
      hooks.fire("PostToolUse", { tool: name, ok: true, bytes: result.length });
    } catch (err) {
      const e = err as Error;
      record.toolResult = { ok: false, error: e.message };
      hooks.fire("PostToolUse", { tool: name, ok: false, error: e.message });
    }
    turn += 1;
  }

  hooks.fire("SessionEnd", budget.snapshot() as unknown as HookPayload);

  const allDone =
    plan.items.length > 0 && plan.items.every((it) => it.status === "done");
  const passed = completed && allDone;

  return {
    plan: plan.summary(),
    budget: budget.snapshot(),
    trace,
    passed,
    turns,
    planSnapshots,
    stopReason,
  };
}
