#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/workflow-lib.sh"

usage() {
  cat <<'USAGE'
Usage: ./scripts/commit-feature.sh "<type>: <summary>"

Stages all current changes and creates a Conventional Commit.
Refuses to commit outside feature/{YYYYMMDD}_{feature-slug}.
USAGE
}

if [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ]; then
  usage
  exit 0
fi

MESSAGE="$*"
if [ -z "$MESSAGE" ]; then
  workflow_fail "Commit message is required. Example: npm run workflow:commit -- \"feat: add favorite locations\""
fi

REPO_ROOT="$(workflow_repo_root)"
cd "$REPO_ROOT"

workflow_assert_not_main_branch
workflow_assert_dated_feature_branch
workflow_assert_conventional_commit "$MESSAGE"

if git diff --quiet && git diff --cached --quiet; then
  workflow_fail "No changes to commit."
fi

workflow_info "Branch: $(workflow_current_branch)"
workflow_info "Staging all changes"
git add -A

workflow_info "Creating commit: $MESSAGE"
git commit -m "$MESSAGE"
workflow_success "Commit created"
