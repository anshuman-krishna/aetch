import { NextResponse } from 'next/server';
import { incrementViewCount } from '@/backend/services/tattoo-service';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await incrementViewCount(id);
  return NextResponse.json({ success: true });
}
