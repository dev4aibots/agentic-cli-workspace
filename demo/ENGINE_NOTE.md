# Engine vendoring note

`lib/engine/` is a **verbatim copy** of
`~/workspace/demos/agentic-cli-workspace/engine/src/` (the faithful port of
`dev4aibots/agentic-cli-workspace` backend logic), and `lib/engine/sandbox/`
is a verbatim copy of `engine/sandbox/`.

The only mechanical change, applied to the copies only: relative import
specifiers `./plan.ts` → `./plan` (etc.). Node/Next bundler module resolution
cannot resolve explicit `.ts` extensions; the originals keep them. **No
logic, constant, guard pattern, stop reason, or eval task was altered.**

The engine runs server-side only, in Node-runtime API routes
(`export const runtime = "nodejs"`), because it uses `node:fs` /
`realpathSync`. Client code never imports it (see `lib/result.ts` for the
client-safe type mirrors).

Sandbox files are bundled into the serverless functions via
`outputFileTracingIncludes` in `next.config.mjs`, so `read_file` reads real
files at runtime on Vercel.
