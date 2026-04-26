export const runtime = 'nodejs';

import { z } from 'zod';
import { NextResponse } from 'next/server';
import { withErrorHandler, errors } from '@/lib/api-error';
import { withRequestId } from '@/backend/middleware/request-log';
import { recordScanResult } from '@/lib/av-scan';

const callbackSchema = z.object({
  jobId: z.string().min(1),
  status: z.enum(['CLEAN', 'INFECTED', 'ERROR', 'SKIPPED']),
  scanResult: z.string().max(500).optional(),
});

// shared-secret callback from external av worker
export const POST = withErrorHandler(async (req: Request) => {
  const expected = process.env.AV_SCAN_WEBHOOK_TOKEN;
  if (expected) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${expected}`) {
      return withRequestId(req, errors.unauthorized('invalid scan callback token'));
    }
  }

  const body = await req.json();
  const parsed = callbackSchema.safeParse(body);
  if (!parsed.success) {
    return withRequestId(
      req,
      NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 }),
    );
  }

  await recordScanResult(parsed.data.jobId, parsed.data.status, parsed.data.scanResult);
  return withRequestId(req, NextResponse.json({ success: true }));
}, 'POST /api/uploads/scan-callback');
