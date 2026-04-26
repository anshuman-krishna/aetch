// optional integration helper — spins up a real postgres via testcontainers.
// requires Docker on the host. Skipped when Docker is unavailable.
//
// usage in an integration test:
//
//   import { withPostgres } from '@/../tests/setup/testcontainers';
//   it.skip(...) // remove .skip when running locally with docker
//   withPostgres(async (databaseUrl) => {
//     process.env.DATABASE_URL = databaseUrl;
//     // run prisma db push, seed, then assertions...
//   });

import { execFileSync } from 'node:child_process';

interface PostgresHandle {
  databaseUrl: string;
  containerId: string;
}

const POSTGRES_IMAGE = 'postgres:16-alpine';
const DEFAULT_DB = 'aetch_int';
const DEFAULT_USER = 'aetch';
const DEFAULT_PASSWORD = 'aetch';

function isDockerAvailable(): boolean {
  try {
    execFileSync('docker', ['version', '--format', '{{.Server.Version}}'], {
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
}

async function startPostgres(): Promise<PostgresHandle> {
  const port = 49000 + Math.floor(Math.random() * 5000);
  const containerId = execFileSync(
    'docker',
    [
      'run',
      '-d',
      '--rm',
      '-e',
      `POSTGRES_USER=${DEFAULT_USER}`,
      '-e',
      `POSTGRES_PASSWORD=${DEFAULT_PASSWORD}`,
      '-e',
      `POSTGRES_DB=${DEFAULT_DB}`,
      '-p',
      `${port}:5432`,
      POSTGRES_IMAGE,
    ],
    { encoding: 'utf8' },
  ).trim();

  // wait for readiness — postgres image emits "ready to accept connections" twice
  for (let i = 0; i < 60; i++) {
    try {
      execFileSync(
        'docker',
        ['exec', containerId, 'pg_isready', '-U', DEFAULT_USER, '-d', DEFAULT_DB],
        { stdio: 'ignore' },
      );
      const databaseUrl = `postgresql://${DEFAULT_USER}:${DEFAULT_PASSWORD}@127.0.0.1:${port}/${DEFAULT_DB}`;
      return { databaseUrl, containerId };
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  execFileSync('docker', ['rm', '-f', containerId], { stdio: 'ignore' });
  throw new Error('postgres container failed to become ready');
}

function stopPostgres(containerId: string): void {
  try {
    execFileSync('docker', ['rm', '-f', containerId], { stdio: 'ignore' });
  } catch {
    /* ignore */
  }
}

export async function withPostgres<T>(
  fn: (databaseUrl: string) => Promise<T>,
): Promise<T | undefined> {
  if (!isDockerAvailable()) {
    console.warn('[testcontainers] docker unavailable — skipping integration body');
    return undefined;
  }
  const handle = await startPostgres();
  try {
    return await fn(handle.databaseUrl);
  } finally {
    stopPostgres(handle.containerId);
  }
}

export const integrationDescribe = isDockerAvailable() ? describe : describe.skip;
