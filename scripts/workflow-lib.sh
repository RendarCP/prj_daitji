#!/bin/bash

set -euo pipefail

WORKFLOW_RED='\033[0;31m'
WORKFLOW_GREEN='\033[0;32m'
WORKFLOW_YELLOW='\033[1;33m'
WORKFLOW_BLUE='\033[0;34m'
WORKFLOW_NC='\033[0m'

workflow_info() {
  printf "${WORKFLOW_BLUE}INFO${WORKFLOW_NC} %s\n" "$1"
}

workflow_success() {
  printf "${WORKFLOW_GREEN}OK${WORKFLOW_NC} %s\n" "$1"
}

workflow_warn() {
  printf "${WORKFLOW_YELLOW}WARN${WORKFLOW_NC} %s\n" "$1"
}

workflow_fail() {
  printf "${WORKFLOW_RED}ERROR${WORKFLOW_NC} %s\n" "$1" >&2
  exit 1
}

workflow_repo_root() {
  git rev-parse --show-toplevel 2>/dev/null || workflow_fail "Git repository not found."
}

workflow_current_branch() {
  git branch --show-current 2>/dev/null || true
}

workflow_sanitize_slug() {
  printf "%s" "$1" \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9._-]+/-/g; s/^-+//; s/-+$//; s/-{2,}/-/g'
}

workflow_require_slug() {
  local raw="${1:-}"
  local slug
  slug="$(workflow_sanitize_slug "$raw")"
  if [ -z "$slug" ]; then
    workflow_fail "Feature slug is required. Example: npm run workflow:new -- favorite-locations"
  fi
  printf "%s" "$slug"
}

workflow_assert_not_main_branch() {
  local branch
  branch="$(workflow_current_branch)"
  if [ "$branch" = "main" ] || [ "$branch" = "master" ]; then
    workflow_fail "Refusing to continue on $branch. Start a feature branch first."
  fi
}

workflow_assert_dated_feature_branch() {
  local branch
  branch="$(workflow_current_branch)"
  if ! printf "%s" "$branch" | grep -Eq '^feature/[0-9]{8}_[a-z0-9._-]+$'; then
    workflow_fail "Refusing to continue on $branch. Expected branch format: feature/{YYYYMMDD}_{feature-slug}"
  fi
}

workflow_assert_conventional_commit() {
  local message="$1"
  if ! printf "%s" "$message" | grep -Eq '^(feat|fix|docs|style|refactor|test|chore|perf|build|ci|revert)(\([A-Za-z0-9._-]+\))?: .+'; then
    workflow_fail "Commit message must follow Conventional Commits, e.g. feat: add favorite locations"
  fi
}
