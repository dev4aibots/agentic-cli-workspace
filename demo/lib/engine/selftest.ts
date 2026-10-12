// Self-validation entry (replaces the asserting main() in upstream index.ts).
// Run with: npx tsx src/selftest.ts  --  exits non-zero on any regression.
// No process.exit in the engine library itself; only this CLI harness exits.
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { runAgent } from "./harness";
import { runEval } from "./eval";

async function main(): Promise<void> {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const sandbox = path.resolve(here, "..", "sandbox");

  const task = "demonstrate the plan-act-observe loop without network calls";
  const result = await runAgent(task, sandbox);
  console.log(result.plan);
  console.log("---");
  console.log(
    `turns=${result.budget.turnsUsed} tokens=${result.budget.tokensUsed} ` +
      `dollars=$${result.budget.dollarsUsed.toFixed(3)} stopReason=${result.stopReason}`,
  );
  console.log("---");
  console.log(`trace events: ${result.trace.length}`);
  for (const ev of result.trace) console.log(" ", JSON.stringify(ev));
  console.log("---");
  const e = await runEval(sandbox);
  console.log(`eval: passed=${e.passed} failed=${e.failed}`);
  if (e.passed !== 3 || e.failed !== 0) {
    throw new Error(`eval regression: passed=${e.passed} failed=${e.failed}`);
  }
  if (!result.passed) {
    throw new Error("scripted demo run did not converge to all-done plan");
  }
  console.log("selftest OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
