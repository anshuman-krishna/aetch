export const runtime = 'nodejs';

import { z } from 'zod';
import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { rateLimit } from '@/backend/middleware/rate-limit';
import { withErrorHandler } from '@/lib/api-error';
import { withRequestId, requestLogger } from '@/backend/middleware/request-log';
import { presignUploadUrl, buildUploadKey } from '@/lib/signed-upload';
import { registerUploadForScan } from '@/lib/av-scan';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const;
const MAX_BYTES = 10 * 1024 * 1024;
const SCOPES = ['tattoos', 'avatars', 'portfolio', 'ar-source'] as const;

const bodySchema = z.object({
  scope: z.enum(SCOPES),
  contentType: z.enum(ALLOWED),
  fileExt: z.string().regex(/^[a-zA-Z0-9]{1,8}$/),
  size: z.number().int().positive().max(MAX_BYTES),
});

export const POST = withErrorHandler(async (req: Request) => {
  const { session, error } = await authGuard();
  if (error) return withRequestId(req, error);

  const rl = await rateLimit(session.user.id, 'upload');
  if (!rl.success) return withRequestId(req, rl.error);

  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return withRequestId(
      req,
      NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 },
      ),
    );
  }

  const bucket = process.env.S3_BUCKET;
  if (!bucket) {
    return withRequestId(
      req,
      NextResponse.json({ success: false, error: 'Storage not configured' }, { status: 503 }),
    );
  }

  const key = buildUploadKey(parsed.data.scope, session.user.id, parsed.data.fileExt);
  const presigned = presignUploadUrl({
    bucket,
    key,
    contentType: parsed.data.contentType,
    contentLength: parsed.data.size,
  });

  // pre-register so client confirm step finds the row + scan can be dispatched after PUT completes
  await registerUploadForScan({
    bucket,
    key,
    userId: session.user.id,
    contentType: parsed.data.contentType,
    sizeBytes: parsed.data.size,
  }).catch((err) => {
    requestLogger(req).warn({ err }, 'register upload failed');
  });

  return withRequestId(req, NextResponse.json({ success: true, key, bucket, ...presigned }));
}, 'POST /api/uploads/sign');
