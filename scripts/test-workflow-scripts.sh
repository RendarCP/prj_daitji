#!/bin/bash

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP_DIR="$(mktemp -d)"
TODAY="$(date +%Y%m%d)"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

fail() {
  echo "FAIL $1" >&2
  exit 1
}

assert_file() {
  [ -f "$1" ] || fail "Expected file: $1"
}

assert_branch() {
  local expected="$1"
  local actual
  actual="$(git branch --show-current)"
  [ "$actual" = "$expected" ] || fail "Expected branch $expected, got $actual"
}

mkdir -p "$TMP_DIR/repo/scripts"
cp "$ROOT/scripts/workflow-lib.sh" "$TMP_DIR/repo/scripts/"
cp "$ROOT/scripts/plan-feature.sh" "$TMP_DIR/repo/scripts/"
cp "$ROOT/scripts/new-feature.sh" "$TMP_DIR/repo/scripts/"
cp "$ROOT/scripts/commit-feature.sh" "$TMP_DIR/repo/scripts/"
cp "$ROOT/scripts/verify-feature.sh" "$TMP_DIR/repo/scripts/"
chmod +x "$TMP_DIR/repo/scripts/"*.sh

cd "$TMP_DIR/repo"
git init --quiet
git checkout -b main --quiet
git config user.email "workflow-test@example.com"
git config user.name "Workflow Test"

echo "# Test Repo" > README.md
git add README.md
git commit -m "docs: seed test repository" --quiet

./scripts/new-feature.sh "Favorite Locations" --title "Favorite locations" >/tmp/workflow-new.out
assert_branch "feature/${TODAY}_favorite-locations"
assert_file "$TMP_DIR/repo/docs/plans/favorite-locations.md"
grep -q "Ambiguity Loop" "$TMP_DIR/repo/docs/plans/favorite-locations.md" || fail "Plan missing ambiguity loop"
grep -q "TDD Plan" "$TMP_DIR/repo/docs/plans/favorite-locations.md" || fail "Plan missing TDD section"
grep -q "Test Agent" "$TMP_DIR/repo/docs/plans/favorite-locations.md" || fail "Plan missing Test Agent"
grep -q "Before implementation" "$TMP_DIR/repo/docs/plans/favorite-locations.md" || fail "Plan missing test-first implementation gate"

if ./scripts/plan-feature.sh "Favorite Locations" >/tmp/workflow-plan.out 2>/tmp/workflow-plan.err; then
  fail "Expected duplicate plan creation to fail"
fi

if ./scripts/plan-feature.sh missing-title --title >/tmp/workflow-missing-title.out 2>/tmp/workflow-missing-title.err; then
  fail "Expected missing title value to fail"
fi

echo "change" >> README.md
if ./scripts/commit-feature.sh "bad message" >/tmp/workflow-bad-commit.out 2>/tmp/workflow-bad-commit.err; then
  fail "Expected invalid commit message to fail"
fi

./scripts/commit-feature.sh "docs: update test readme" >/tmp/workflow-good-commit.out

git switch -c feature/wrong-branch --quiet
echo "wrong branch change" >> README.md
if ./scripts/commit-feature.sh "docs: should require dated feature branch" >/tmp/workflow-wrong-branch-commit.out 2>/tmp/workflow-wrong-branch-commit.err; then
  fail "Expected commit outside dated feature branch to fail"
fi
git restore README.md

git switch main --quiet
echo "main change" >> README.md
if ./scripts/commit-feature.sh "docs: should be blocked" >/tmp/workflow-main-commit.out 2>/tmp/workflow-main-commit.err; then
  fail "Expected commit on main to fail"
fi

echo "PASS workflow scripts"
