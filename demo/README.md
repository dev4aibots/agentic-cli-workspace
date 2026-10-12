# agentic-cli-workspace — Live UI Demo

**[Live demo →](https://agentic-cli-workspace-demo.vercel.app)**

> **Source:** this demo lives in the `demo/` subdirectory of [dev4aibots/agentic-cli-workspace](https://github.com/dev4aibots/agentic-cli-workspace) (repo plan v3 — no separate demo repo; the original code is untouched).

A working, portfolio-grade UI for [`dev4aibots/agentic-cli-workspace`](https://github.com/dev4aibots/agentic-cli-workspace) — a coding-agent harness that runs a **plan → act → observe** loop with hard budget guards and PreToolUse safety hooks.

This demo runs the **real engine**, ported faithfully from the upstream repo — not a mock. Type a task, watch the agent plan, execute tools, get blocked by safety guards, and stop when the budget runs out.

## What it shows

- **Plan → act → observe loop** — the agent writes a plan, rewrites it whole as it learns, dispatches tools, and observes results, exactly like the upstream harness.
- **Budget gates** — max turns, max tokens, max dollars. Sliders let you crank the budget down to zero and watch the run halt mid-loop with the correct stop reason (`turn_limit`, `budget`, `complete`…).
- **Safety playground** — a `PreToolUse` destructive-guard hook blocks dangerous tool calls before they run. Toggle hooks on/off and see the difference.
- **Real sandboxed file tools** — `read_file` reads real files shipped inside the serverless function; the file tool cannot escape the sandbox directory.
- **Eval harness** — a 3-case eval suite runs the agent end-to-end and scores completion, so you can verify the loop's behavior, not just its looks.
- **Linear-style task runner UI** — keyboard-first command bar (⌘K), task views, turn-by-turn run timeline, plan snapshots per turn.

## How the real engine is ported

`lib/engine/` is a **verbatim port** of the upstream `src/` from `dev4aibots/agentic-cli-workspace`, with dossier bugs fixed (not copied). See `ENGINE_NOTE.md` for the exact mechanics:

- Import specifiers mechanically normalized for the Next.js bundler (`.ts` → extensionless); **no logic, constant, guard pattern, stop reason, or eval task altered.**
- The engine runs server-side only in Node-runtime API routes (`export const runtime = "nodejs"`) because it uses `node:fs` / `realpathSync`. Client code never imports it (`lib/result.ts` holds the client-safe type mirrors).
- Sandbox files are bundled into the serverless functions via `outputFileTracingIncludes` in `next.config.mjs`.

Key API routes:

| Route              | What it does                                                              |
| ------------------ | ------------------------------------------------------------------------- |
| `POST /api/run`    | Run the agent on a task. `{ "task": "summarize README" }` → full turn records |
| `POST /api/eval`   | Run the 3-case eval harness → per-case scores                              |
| `POST /api/safety` | Exercise the safety-hook layer directly                                    |

All routes are deterministic and offline — **no API keys, no network calls, no login.**

## Run locally

```bash
npm install
npm run dev        # → http://localhost:3000
npm run build      # production build (also verified by CI on push)
```

Requires Node 18+.

## Try it live

1. Open the [live demo](https://agentic-cli-workspace-demo.vercel.app).
2. Press **⌘K**, type a task (e.g. `summarize README`, `list the sandbox files`, `write a todo plan for adding logging`).
3. Watch turns accumulate: plan rewrites, tool calls, observations, budget burn.
4. Drag the **budget sliders** to extreme lows — the run stops with the real stop reason.
5. Toggle the **destructive guard** off, send a risky task, and compare.
6. Open the **Eval** tab and run the 3-case harness.

## Tech

Next.js 14 (App Router, Node runtime) · React 18 · Tailwind CSS · TypeScript · Zod. Deterministic scripted model — no LLM calls, which is exactly why the safety and budget behavior is testable and repeatable.

Deployed on Vercel with GitHub auto-deploy: every push to `main` rebuilds the live site.

## Design

Linear dark aesthetic: hand-written shadcn-style components themed by Linear tokens (`app/globals.css`), one hand-reimplemented react-bits **BlurText** hero anchor, Inter + JetBrains Mono, hairline borders, no elevation shadows (indigo CTA glow only), no emojis.

## Origin

Built as a portfolio UI demo for the backend project [`dev4aibots/agentic-cli-workspace`](https://github.com/dev4aibots/agentic-cli-workspace) by [dev4aibots](https://github.com/dev4aibots).
