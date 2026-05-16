# Script Guidelines

## Scope
Applies to shell scripts under `scripts/`.

## Rules
- Use Bash and keep scripts executable.
- Fail fast with `set -euo pipefail`.
- Put shared workflow helpers in `scripts/workflow-lib.sh`.
- Scripts that mutate git state must print the branch and action before doing it.
- Never allow automated commits outside `feature/{YYYYMMDD}_{feature-slug}`.

## Verification
- Run `npm run test:workflow` after changing workflow scripts.
- Run `npm run workflow:verify` before opening a PR.
