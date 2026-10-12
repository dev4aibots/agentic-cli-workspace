#!/usr/bin/env bash
# anti-slop.sh — runs the shared anti-slop gate against the demo's
# demo-authored source only.
# Excluded with rationale:
#   node_modules/, .next/ — vendored/build output, not demo copy.
#   lib/engine/ — vendored VERBATIM from upstream (claims.json binds this);
#     its pre-existing docs keep their original punctuation.
# Exit 0 = all targets pass.
set -u
WEB="$HOME/workspace/demos/agentic-cli-workspace/web"
CHECK="$HOME/workspace/demos/design-overhaul/research/tooling/anti-slop-check.sh"
FAIL=0
for t in app components scripts lib/result.ts lib/sandboxPath.ts lib/type-scale.ts; do
  echo "--- $t ---"
  bash "$CHECK" "$WEB/$t" || FAIL=1
done
exit "$FAIL"
