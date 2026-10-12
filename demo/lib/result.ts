/** Client-safe mirrors of the engine result types (no engine imports — the
 *  engine uses node:fs and must stay server-only). */

export type Status = "pending" | "in_progress" | "done" | "failed";

export type TodoItem = {
  id: number;
  description: string;
  status: Status;
  note: string;
};

export type ToolCall = { name: string; args: Record<string, string> };

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
  budgetAfter: { turnsUsed: number; tokensUsed: number; dollarsUsed: number };
};

export type EngineRunResult = {
  plan: string;
  budget: { turnsUsed: number; tokensUsed: number; dollarsUsed: number };
  /**
   * Budget limits frozen at run start. Every gauge limit renders from this
   * snapshot — never from the live slider state (BUG-17).
   */
  budgetSnapshot: BudgetLimits;
  trace: Record<string, unknown>[];
  passed: boolean;
  turns: TurnRecord[];
  planSnapshots: string[];
  stopReason: string;
};

export type BudgetLimits = {
  maxTurns: number;
  maxTokens: number;
  maxDollars: number;
};

export const DEFAULT_BUDGET: BudgetLimits = {
  maxTurns: 50,
  maxTokens: 200000,
  maxDollars: 5.0,
};

export type EvalCaseResult = {
  task: string;
  expectedDone: number;
  doneCount: number;
  passed: boolean;
  turns: number;
  stopReason: string;
  tokensUsed: number;
  dollarsUsed: number;
};

export const STATUS_MARK: Record<Status, string> = {
  pending: " ",
  in_progress: ">",
  done: "x",
  failed: "!",
};

export const STATUS_TONE: Record<Status, "muted" | "info" | "success" | "danger"> = {
  pending: "muted",
  in_progress: "info",
  done: "success",
  failed: "danger",
};
