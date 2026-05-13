#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/workflow-lib.sh"

usage() {
  cat <<'USAGE'
Usage: ./scripts/new-feature.sh <feature-slug> [--title "Feature title"]

Creates or switches to feature/<feature-slug> and creates docs/plans/<feature-slug>.md.
Run this at the start of every new feature session.
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
TARGET_BRANCH="feature/$SLUG"
CURRENT_BRANCH="$(workflow_current_branch)"

cd "$REPO_ROOT"

workflow_info "Current branch: ${CURRENT_BRANCH:-unknown}"
workflow_info "Target branch: $TARGET_BRANCH"

if [ "$CURRENT_BRANCH" = "$TARGET_BRANCH" ]; then
  workflow_success "Already on $TARGET_BRANCH"
elif git show-ref --verify --quiet "refs/heads/$TARGET_BRANCH"; then
  workflow_info "Switching to existing branch $TARGET_BRANCH"
  git switch "$TARGET_BRANCH"
elif [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "master" ]; then
  workflow_info "Creating branch $TARGET_BRANCH"
  git switch -c "$TARGET_BRANCH"
else
  workflow_fail "Start new feature work from main/master or switch to $TARGET_BRANCH explicitly. Current branch: $CURRENT_BRANCH"
fi

PLAN_ARGS=("$SLUG")
if [ -n "$TITLE" ]; then
  PLAN_ARGS+=("--title" "$TITLE")
fi

if [ -f "$REPO_ROOT/docs/plans/$SLUG.md" ]; then
  workflow_warn "Plan already exists: docs/plans/$SLUG.md"
else
  "$SCRIPT_DIR/plan-feature.sh" "${PLAN_ARGS[@]}"
fi

workflow_success "Feature session ready on $TARGET_BRANCH"
