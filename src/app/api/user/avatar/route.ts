export const runtime = "nodejs";

import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { rateLimit } from '@/backend/middleware/rate-limit';
import { updateUserAvatar } from '@/backend/services/user-service';
import { uploadAvatar } from '@/lib/upload';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const rl = await rateLimit(session.user.id, 'upload');
  if (!rl.success) return rl.error;

  try {
    const formData = await request.formData();
    const file = formData.get('avatar');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadAvatar(buffer, file.type, session.user.id);
    await updateUserAvatar(session.user.id, result.url);

    return NextResponse.json({ success: true, data: { url: result.url } });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
