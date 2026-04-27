export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { withErrorHandler } from '@/lib/api-error';
import { withRequestId } from '@/backend/middleware/request-log';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { longevitySchema } from '@/lib/validations';
import { simulateAgingTimeline } from '@/backend/services/longevity-service';

export const POST = withErrorHandler(async (req: Request) => {
  if (!isFeatureEnabled('LONGEVITY_ENABLED')) {
    return withRequestId(
      req,
      NextResponse.json({ success: false, error: 'Longevity disabled' }, { status: 403 }),
    );
  }
  const { error } = await authGuard();
  if (error) return withRequestId(req, error);

  const body = await req.json();
  const parsed = longevitySchema.safeParse(body);
  if (!parsed.success) {
    return withRequestId(
      req,
      NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 },
      ),
    );
  }

  const timeline = simulateAgingTimeline({
    lineThickness: parsed.data.lineThickness,
    colorPalette: parsed.data.colorPalette,
    placement: parsed.data.placement,
    style: parsed.data.style,
  });

  return withRequestId(
    req,
    NextResponse.json({ success: true, imageUrl: parsed.data.imageUrl, timeline }),
  );
}, 'POST /api/longevity');
