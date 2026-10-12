import path from "node:path";

/** Absolute path to the vendored engine sandbox (real files on disk). */
export function sandboxDir(): string {
  return path.join(process.cwd(), "lib", "engine", "sandbox");
}

/**
 * Display version of an engine-internal absolute path for the UI (BUG-20).
 * The sandbox root renders as "/sandbox"; anything else under the deploy
 * working directory renders relative to it ("/lib/etc/passwd"). Server
 * filesystem layout (e.g. /var/task/...) never reaches clients.
 */
export function displayPath(abs: string): string {
  const sb = sandboxDir();
  if (abs === sb) return "/sandbox";
  if (abs.startsWith(sb + path.sep)) return "/sandbox" + abs.slice(sb.length);
  const cwd = process.cwd();
  if (abs === cwd) return "/";
  if (abs.startsWith(cwd + path.sep)) return abs.slice(cwd.length);
  return abs;
}

/**
 * Redact engine-internal absolute paths inside an engine-generated string
 * (error messages, trace fields). Rewrites the known prefixes only:
 * the sandbox root becomes "/sandbox" and the deploy cwd prefix is
 * stripped. Containment semantics are untouched — this is display-only.
 */
export function redactPaths(text: string): string {
  const sb = sandboxDir();
  const cwd = process.cwd();
  return text.split(sb).join("/sandbox").split(cwd).join("");
}
