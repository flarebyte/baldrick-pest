#!/usr/bin/env bash
set -euo pipefail

run() {
  echo "\n==> $*" >&2
  eval "$*"
}

echo "Baldrick Pest — full local check"
echo "Node: $(node -v) | Yarn: $(yarn -v)"

# 1) Install deps (idempotent)
run "yarn install --silent"

# 2) Markdown lint
run "npx baldrick-broth@latest md check"

# 3) Code lint (broth wrapper + direct XO for detailed output)
run "npx baldrick-broth@latest lint check"
# Ensure we see precise file diagnostics and fail if any
run "npx xo 'src/**/*.ts'"
# Quick focused check for a common hotspot
run "npx xo src/execution.ts"

# 4) Unit tests (Node test runner)
run "yarn test"

# 5) Build CLI to dist/
run "yarn build"

# 6) Quick CLI version check from built output
run "node dist/src/cli.mjs -V"

# 7) Run a sample pest spec locally from built output
run "node dist/src/cli.mjs test --spec-file pest-spec/simple.pest.yaml"

echo "\nAll checks completed successfully."
