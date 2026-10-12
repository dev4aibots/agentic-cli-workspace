import { NextResponse } from "next/server";
import { EVAL_TASKS, runAgent } from "@/lib/engine";
import { sandboxDir } from "@/lib/sandboxPath";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Runs the engine eval suite and returns per-case detail.
 * Pass rule is the engine's verbatim rule: passed && doneCount >= expectedDone.
 */
export async function POST() {
  const dir = sandboxDir();
  const cases = [];
  let passed = 0;
  for (const t of EVAL_TASKS) {
    const r = await runAgent(t.task, dir);
    const doneCount = (r.plan.match(/\[x\]/g) ?? []).length;
    const casePassed = r.passed && doneCount >= t.expectedDone;
    if (casePassed) passed += 1;
    cases.push({
      task: t.task,
      expectedDone: t.expectedDone,
      doneCount,
      passed: casePassed,
      turns: r.turns.length,
      stopReason: r.stopReason,
      tokensUsed: r.budget.tokensUsed,
      dollarsUsed: r.budget.dollarsUsed,
    });
  }
  return NextResponse.json({
    cases,
    passed,
    failed: cases.length - passed,
  });
}
