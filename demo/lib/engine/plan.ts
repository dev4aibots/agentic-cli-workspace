// Ported verbatim from upstream src/plan.ts (dev4aibots/agentic-cli-workspace).
// Budget defaults are HARD constants: 50 turns / 200000 tokens / $5.00.
// Do not change them; UI sliders override per-call via harness budgetOverrides.
import type { Status, TodoItem } from "./types";

export class PlanState {
  goal: string;
  items: TodoItem[];

  constructor(goal: string) {
    this.goal = goal;
    this.items = [];
  }

  rewrite(items: TodoItem[]): void {
    this.items = items.map((it) => ({ ...it }));
  }

  summary(): string {
    const mark: Record<Status, string> = {
      pending: " ",
      in_progress: ">",
      done: "x",
      failed: "!",
    };
    const lines = [`GOAL: ${this.goal}`];
    for (const it of this.items) {
      lines.push(`  [${mark[it.status]}] ${it.id}. ${it.description}`);
    }
    return lines.join("\n");
  }
}

export class Budget {
  maxTurns = 50;
  maxTokens = 200_000;
  maxDollars = 5.0;
  turnsUsed = 0;
  tokensUsed = 0;
  dollarsUsed = 0;

  step(tokens: number, dollars: number): void {
    if (tokens < 0 || dollars < 0) {
      throw new RangeError("Budget.step requires non-negative tokens and dollars");
    }
    this.turnsUsed += 1;
    this.tokensUsed += tokens;
    this.dollarsUsed += dollars;
  }

  exceeded(): string | null {
    if (this.turnsUsed >= this.maxTurns) return "turn_limit";
    if (this.tokensUsed >= this.maxTokens) return "token_limit";
    if (this.dollarsUsed >= this.maxDollars) return "dollar_limit";
    return null;
  }

  snapshot(): { turnsUsed: number; tokensUsed: number; dollarsUsed: number } {
    return {
      turnsUsed: this.turnsUsed,
      tokensUsed: this.tokensUsed,
      dollarsUsed: this.dollarsUsed,
    };
  }
}
