export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { captureException } from '@/lib/sentry';
import { rateLimit } from '@/backend/middleware/rate-limit';

interface ErrorReport {
  message?: string;
  digest?: string;
  stack?: string;
  url?: string;
}

// client error boundary sink
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anon';
  const rl = await rateLimit(`err:${ip}`, 'api');
  if (!rl.success) return rl.error;

  let body: ErrorReport = {};
  try {
    body = (await req.json()) as ErrorReport;
  } catch {
    return NextResponse.json({ ok: true });
  }

  const trimmed: ErrorReport = {
    message: body.message?.slice(0, 500),
    digest: body.digest?.slice(0, 64),
    stack: body.stack?.slice(0, 4000),
    url: body.url?.slice(0, 500),
  };

  captureException(new Error(trimmed.message ?? 'client error'), {
    source: 'client-error-boundary',
    ...trimmed,
  });

  return NextResponse.json({ ok: true });
}
