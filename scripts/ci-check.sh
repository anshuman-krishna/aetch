#!/usr/bin/env bash
set -euo pipefail

# full CI pipeline: format → lint → typecheck → prisma validate → test → build → audit

PASS="\033[32m✓\033[0m"
FAIL="\033[31m✗\033[0m"

section() {
  echo ""
  echo "── $1 ──────────────────────────────"
}

section "format"
npm run format:check

section "lint"
npm run lint

section "typecheck"
npx tsc --noEmit

section "prisma validate"
npx prisma validate

section "unit + service tests"
npm run test -- --coverage --passWithNoTests

section "next build"
npm run build

section "npm audit (prod)"
# non-blocking for moderate; fails on high/critical
npm audit --omit=dev --audit-level=high || {
  echo -e "$FAIL npm audit found high/critical vulns"
  exit 1
}

echo ""
echo -e "$PASS ci:check passed"
