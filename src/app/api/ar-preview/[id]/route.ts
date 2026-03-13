import { NextResponse } from 'next/server';
import { authGuard } from '@/backend/middleware/auth-guard';
import { getPreviewById, deletePreview } from '@/backend/services/ar-preview-service';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, error } = await authGuard();
  if (error) return error;

  const { id } = await params;
  const preview = await getPreviewById(id);

  if (!preview || preview.userId !== session!.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ preview });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, error } = await authGuard();
  if (error) return error;

  const { id } = await params;

  try {
    await deletePreview(id, session!.user.id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
