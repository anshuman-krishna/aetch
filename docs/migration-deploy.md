# Migration & Deploy Strategy

How we move schema changes from dev to production safely.

## Local development

- `npm run db:migrate` (prompts for migration name, applies to local DB)
- Commit the generated migration folder under `prisma/migrations/`
- Never edit a migration file after it has been committed/pushed

## Production deploy

Migrations are applied _before_ the app binary goes live.

**On Vercel** we run `prisma migrate deploy` in a dedicated step (either a GitHub Actions job before the Vercel deploy, or via a release phase script):

```yaml
- name: apply migrations
  run: npx prisma migrate deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL_MIGRATE }}
```

`DATABASE_URL_MIGRATE` is a direct connection (non-pooled) because Prisma migrations need a single persistent session. App runtime uses a pooled URL (`DATABASE_URL`, Neon / Supabase PgBouncer, `?pgbouncer=true`).

## Zero-downtime rules

1. **Additive first.** New columns default to nullable or have defaults. Never drop or rename in the same migration as code that reads the old name.
2. **Two-phase destructive changes.** Deploy code that writes both old and new. Backfill. Deploy code that reads only new. Drop old column in a later release.
3. **No long-running migrations in the deploy step.** For big backfills, run them as a separate job (SQL or a script) _after_ the migration that adds the column but _before_ code depends on it.
4. **Lock-sensitive operations** (e.g. `ALTER TABLE ... NOT NULL`, index creation on large tables) — prefer `CREATE INDEX CONCURRENTLY` and dual-phase constraint additions.

## Prisma + connection pooling

- App runtime: `DATABASE_URL=postgres://.../aetch?pgbouncer=true&connection_limit=1`
- Migrations: `DATABASE_URL_MIGRATE=postgres://.../aetch` (direct)
- On Neon: use `neondb_owner` for migrations, a role with narrower grants for runtime

## Rollback

- We do not auto-rollback migrations. If a migration goes bad:
  1. Roll the app back to the previous deploy (Vercel instant rollback)
  2. Write a _new_ forward-only migration that reverses the damage
  3. Never run `prisma migrate reset` in production

## Release checklist

- [ ] New migration file committed and reviewed
- [ ] Two-phase strategy applied if destructive
- [ ] Local `prisma migrate dev` + `prisma generate` succeeds
- [ ] Staging migration run, app boot verified
- [ ] Production direct URL available in CI secrets
- [ ] Post-deploy smoke: `/api/health`, Prisma query on a tiny read path

## Env parity

All env vars required by `src/lib/env.ts` must be present in Vercel (Preview + Production). The schema validates at boot; a missing value fails fast rather than silently at first request. Run locally:

```bash
npm run dev:check
```

…to audit your `.env` against the schema.
