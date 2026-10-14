// Ported verbatim from upstream src/tools.ts (dev4aibots/agentic-cli-workspace).
// read_file: zod-validated args, realpathSync sandbox containment, 4096-byte
// truncation, throws "path escapes sandbox" on escape. run_shell: deterministic
// stub with canned ls / git status outputs. No real shell is ever spawned.
import { readFileSync, realpathSync } from "node:fs";
import * as path from "node:path";
import { z } from "zod";
import type { ToolArgs, ToolFn } from "./types";

export const TRUNCATE_BYTES = 4096;

export const ReadFileArgs = z.object({ path: z.string().min(1) });
export const RunShellArgs = z.object({ cmd: z.string().min(1) });

export function toolReadFile(sandbox: string, args: ToolArgs): string {
  const parsed = ReadFileArgs.parse(args);
  const candidate = path.resolve(sandbox, parsed.path);
  const sandboxResolved = path.resolve(sandbox);
  let full: string;
  let root: string;
  try {
    full = realpathSync(candidate);
    root = realpathSync(sandboxResolved);
  } catch (err) {
    // QA-6: report the attempted path relative to the sandbox root
    // ('/sandbox/../../etc/passwd'). realpathSync reports the first missing
    // path component (e.g. '.../lib/etc'), which after redaction looked like
    // a server-layout artifact ('/lib/etc') rather than an escape attempt.
    const rel = path
      .relative(sandboxResolved, candidate)
      .split(path.sep)
      .join("/");
    const sysMsg = (err as Error).message.replace(
      /'[^']*'/,
      `'/sandbox/${rel}'`,
    );
    throw new Error(`path escapes sandbox: ${sysMsg}`);
  }
  if (full !== root && !full.startsWith(root + path.sep)) {
    throw new Error("path escapes sandbox");
  }
  const data = readFileSync(full, "utf8");
  return data.slice(0, TRUNCATE_BYTES);
}

export function toolRunShell(_sandbox: string, args: ToolArgs): string {
  const parsed = RunShellArgs.parse(args);
  const stub: Record<string, string> = {
    ls: "README.md\nsrc\ntests",
    "git status": "On branch agent/demo\nnothing to commit, working tree clean",
  };
  const out = stub[parsed.cmd] ?? `(stub) ran: ${parsed.cmd}`;
  return `exit=0\n${out.slice(0, TRUNCATE_BYTES)}`;
}

export const TOOLS: Record<string, ToolFn> = {
  read_file: toolReadFile,
  run_shell: toolRunShell,
};
