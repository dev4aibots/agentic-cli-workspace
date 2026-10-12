import path from "node:path";

/** Absolute path to the vendored engine sandbox (real files on disk). */
export function sandboxDir(): string {
  return path.join(process.cwd(), "lib", "engine", "sandbox");
}
