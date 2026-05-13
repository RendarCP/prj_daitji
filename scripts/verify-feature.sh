#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/workflow-lib.sh"

WITH_PLAYWRIGHT="false"

while [ "$#" -gt 0 ]; do
  case "$1" in
    --with-playwright)
      WITH_PLAYWRIGHT="true"
      ;;
    -h|--help)
      cat <<'USAGE'
Usage: ./scripts/verify-feature.sh [--with-playwright]

Runs workflow script tests, lint, type-check, and build.
With --with-playwright, also runs npm script test:e2e or local Playwright when configured.
USAGE
      exit 0
      ;;
    *)
      workflow_fail "Unexpected argument: $1"
      ;;
  esac
  shift
done

REPO_ROOT="$(workflow_repo_root)"
cd "$REPO_ROOT"

workflow_info "Running workflow automation tests"
npm run test:workflow

workflow_info "Running lint"
npm run lint

workflow_info "Running type-check"
npm run type-check

workflow_info "Running build"
npm run build

if [ "$WITH_PLAYWRIGHT" = "true" ]; then
  if npm run | grep -q "test:e2e"; then
    workflow_info "Running npm run test:e2e"
    npm run test:e2e
  elif [ -x "$REPO_ROOT/node_modules/.bin/playwright" ]; then
    workflow_info "Running local Playwright test"
    "$REPO_ROOT/node_modules/.bin/playwright" test
  else
    workflow_warn "No Playwright test runner configured. Use Playwright MCP checklist: docs/process/playwright-mcp-qa.md"
  fi
fi

workflow_success "Verification complete"
