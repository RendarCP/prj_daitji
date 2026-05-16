#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/workflow-lib.sh"

usage() {
  cat <<'USAGE'
Usage: ./scripts/plan-feature.sh <feature-slug> [--title "Feature title"]

Creates docs/plans/<feature-slug>.md from the repository feature-plan template.
USAGE
}

FEATURE_RAW=""
TITLE=""

while [ "$#" -gt 0 ]; do
  case "$1" in
    --title)
      if [ "$#" -lt 2 ]; then
        workflow_fail "--title requires a value."
      fi
      shift
      TITLE="$1"
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      if [ -z "$FEATURE_RAW" ]; then
        FEATURE_RAW="$1"
      else
        workflow_fail "Unexpected argument: $1"
      fi
      ;;
  esac
  shift || true
done

SLUG="$(workflow_require_slug "$FEATURE_RAW")"
REPO_ROOT="$(workflow_repo_root)"
PLAN_PATH="$REPO_ROOT/docs/plans/$SLUG.md"

if [ -z "$TITLE" ]; then
  TITLE="$SLUG"
fi

if [ -f "$PLAN_PATH" ]; then
  workflow_fail "Plan already exists: docs/plans/$SLUG.md"
fi

mkdir -p "$REPO_ROOT/docs/plans"

cat > "$PLAN_PATH" <<EOF
# $TITLE

## Status
- Branch: \`$(workflow_current_branch)\`
- Created: $(date +%Y-%m-%d)
- Owner: TBD

## Problem
Describe the user problem and why this needs to exist.

## Scope
- In:
- Out:

## Ambiguity Loop
Use this section before implementation. Keep asking until every blocker is resolved or intentionally deferred.

| Question | Decision | Status |
| --- | --- | --- |
| What is the first user-visible behavior? | TBD | Open |
| What must not change? | TBD | Open |
| What is hard to test directly? | TBD | Open |

## Agent Team
- Main Agent: receive the request, call Planner Agent, collect Sub Agent results, and report only the final summary.
- Planner Agent: convert the request or PRD into an Agent Execution Plan and allow implementation only on \`feature/{YYYYMMDD}_$SLUG\` style branches.
- Test Agent: define or add the first failing behavior test or automation check before implementation.
- Backend Agent: own API, database, auth, validation, and server-side business logic when affected.
- Frontend Agent: own UI, client interaction, API wiring, loading/error/empty states, and accessibility after the first test exists.
- Infra Agent: own environment, deployment, queue/cron/worker, logging, and monitoring impacts when affected.
- QA Agent: verify user scenarios and record release readiness.
- Reviewer Agent: review requirement gaps, agent conflicts, security, performance, and maintainability risks.

## TDD Plan
Before implementation, add or define one behavior test or automation check. Then use vertical slices: failing check, smallest implementation, repeat.

| Order | Behavior | Test or automation | Notes |
| --- | --- | --- | --- |
| 1 | TBD | TBD | TBD |

## Implementation Notes
- Affected routes:
- Affected components:
- Affected lib/server modules:
- Data or migration changes:

## QA Plan
- Automated checks: \`npm run workflow:verify\`
- Browser checks: Playwright MCP pass using \`docs/process/playwright-mcp-qa.md\`
- API checks:

## QA Notes
- Pending.

## Commit Plan
- Suggested commit: \`feat: $TITLE\`
EOF

workflow_success "Created docs/plans/$SLUG.md"
