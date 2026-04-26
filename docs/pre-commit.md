# Local pre-commit hook

Husky + lint-staged + gitleaks run before every commit.

## Install

```bash
npm install --save-dev husky lint-staged
brew install gitleaks
npm run prepare
chmod +x .husky/pre-commit
```

The `prepare` script wires husky into `.git/hooks/`.

## What runs

1. `gitleaks protect --staged --redact --config .gitleaks.toml` — fails on any secret-looking blob in staged content.
2. `lint-staged` — runs `prettier --write` + `eslint --fix` on the changed files only (config: `.lintstagedrc.json`).

## Override (rare)

Skip with `git commit --no-verify` only when the failure is a known false positive — never to bypass real findings.
