export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { requireRole } from '@/backend/middleware/role-guard';
import { deleteTattoo } from '@/backend/services/tattoo-service';

// delete tattoo (admin only)
export async function DELETE(req: Request) {
  const { error } = await requireRole('ADMIN');
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const tattooId = searchParams.get('id');

  if (!tattooId) {
    return NextResponse.json(
      { success: false, error: 'Tattoo ID required' },
      { status: 400 },
    );
  }

  await deleteTattoo(tattooId);
  return NextResponse.json({ success: true });
}
