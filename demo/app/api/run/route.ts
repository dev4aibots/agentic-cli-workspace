import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runAgent } from "@/lib/engine";
import { sandboxDir, displayPath, redactPaths } from "@/lib/sandboxPath";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  task: z.string().min(1).max(2000),
  budget: z
    .object({
      maxTurns: z.number().finite().nonnegative().optional(),
      maxTokens: z.number().finite().nonnegative().optional(),
      maxDollars: z.number().finite().nonnegative().optional(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid request", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  try {
    const result = await runAgent(
      parsed.data.task,
      sandboxDir(),
      parsed.data.budget ?? {},
    );
    // BUG-20: redact engine-internal absolute paths before they reach the
    // UI — the SessionStart trace event carries the sandbox dir and tool
    // errors can embed resolved paths (e.g. ENOENT on an escape attempt).
    // Containment behavior is untouched; this is display-only.
    for (const p of result.trace as Record<string, unknown>[]) {
      if (typeof p.sandbox === "string") p.sandbox = displayPath(p.sandbox);
      if (typeof p.error === "string") p.error = redactPaths(p.error);
    }
    for (const t of result.turns) {
      if (typeof t.toolResult?.error === "string") {
        t.toolResult.error = redactPaths(t.toolResult.error);
      }
    }
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 },
    );
  }
}
