import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { HookBus, destructiveGuard, toolReadFile } from "@/lib/engine";
import { sandboxDir } from "@/lib/sandboxPath";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  probe: z.enum(["destructive", "escape", "safe"]),
});

/**
 * Safety playground: exercises the REAL engine guard + sandbox containment
 * outside the scripted agent script, and returns the true results.
 * - "destructive": runs destructiveGuard against run_shell {cmd: "rm -rf /tmp/test"}
 * - "escape": runs toolReadFile against {"path": "../../etc/passwd"} (escape attempt)
 * - "safe": runs destructiveGuard against a benign cmd for contrast
 */
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

  const bus = new HookBus();
  bus.on("PreToolUse", destructiveGuard);
  const dir = sandboxDir();

  if (parsed.data.probe === "destructive") {
    const tool = "run_shell";
    const args = { cmd: "rm -rf /tmp/test" };
    const pre = bus.fire("PreToolUse", { tool, args });
    return NextResponse.json({
      probe: "destructive",
      tool,
      args,
      preToolUse: pre,
      blocked: pre.blocked === true,
      blockReason: typeof pre.reason === "string" ? pre.reason : null,
      shellSpawned: false,
    });
  }

  if (parsed.data.probe === "escape") {
    const tool = "read_file";
    const args = { path: "../../etc/passwd" };
    bus.fire("PreToolUse", { tool, args });
    let error: string | null = null;
    let output: string | null = null;
    try {
      output = toolReadFile(dir, args);
    } catch (err) {
      error = (err as Error).message;
    }
    return NextResponse.json({
      probe: "escape",
      tool,
      args,
      output,
      error,
      escaped: error === null,
    });
  }

  const tool = "run_shell";
  const args = { cmd: "ls" };
  const pre = bus.fire("PreToolUse", { tool, args });
  return NextResponse.json({
    probe: "safe",
    tool,
    args,
    preToolUse: pre,
    blocked: pre.blocked === true,
  });
}
