// Adapted from upstream src/eval.ts (dev4aibots/agentic-cli-workspace).
//
// EVAL_TASKS, the [x] mark counting, and the pass rule (r.passed &&
// doneCount >= expectedDone) are verbatim. Only the call to runAgent became
// async (runAgent is async in the engine) and the param is named sandboxDir.
import { runAgent } from "./harness";

export type EvalCase = { task: string; expectedDone: number };

export const EVAL_TASKS: EvalCase[] = [
  { task: "diagnose worker.rs", expectedDone: 3 },
  { task: "summarize README", expectedDone: 3 },
  { task: "run smoke tests", expectedDone: 3 },
];

export type EvalResult = { passed: number; failed: number };

export async function runEval(
  sandboxDir: string,
  cases: EvalCase[] = EVAL_TASKS,
): Promise<EvalResult> {
  let passed = 0;
  let failed = 0;
  for (const t of cases) {
    const r = await runAgent(t.task, sandboxDir);
    const doneCount = (r.plan.match(/\[x\]/g) ?? []).length;
    if (r.passed && doneCount >= t.expectedDone) passed += 1;
    else failed += 1;
  }
  return { passed, failed };
}
