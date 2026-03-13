export const runtime = "nodejs";

import { NextResponse } from 'next/server';
import { incrementViewCount } from '@/backend/services/tattoo-service';
import { rateLimit } from '@/backend/middleware/rate-limit';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // rate limit by ip
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous';
  const rl = await rateLimit(ip, 'api');
  if (!rl.success) return rl.error;

  const { id } = await params;
  await incrementViewCount(id);
  return NextResponse.json({ success: true });
}
