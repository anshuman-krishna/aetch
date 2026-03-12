import { NextRequest, NextResponse } from 'next/server';
import { getTrendingTattoos } from '@/backend/services/tattoo-service';

export async function GET(req: NextRequest) {
  const limit = Number(req.nextUrl.searchParams.get('limit') ?? 20);
  const tattoos = await getTrendingTattoos(Math.min(limit, 50));
  return NextResponse.json({ success: true, tattoos });
}
