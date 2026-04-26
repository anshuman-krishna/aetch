# Integration tests (Postgres)

Reserved for tests that need a real database instead of a `prisma` mock.

## How

```ts
import { integrationDescribe, withPostgres } from '../setup/testcontainers';

integrationDescribe('booking lifecycle (real db)', () => {
  it('creates and transitions a booking', async () => {
    await withPostgres(async (databaseUrl) => {
      process.env.DATABASE_URL = databaseUrl;
      const { execSync } = await import('node:child_process');
      execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
      // run actual prisma calls + assertions here
    });
  });
});
```

Requires Docker. When Docker is not available the suite is auto-skipped, so CI without a Docker daemon stays green.
