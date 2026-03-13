import { NextResponse } from 'next/server';
import { requireRole } from '@/backend/middleware/role-guard';
import { getShopByOwnerId, getShopBookings } from '@/backend/services/shop-service';
import { getPaginationParams } from '@/utils/pagination';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: Params) {
  const { session, error } = await requireRole('SHOP_OWNER', 'ADMIN');
  if (error) return error;

  const { id: shopId } = await params;

  // verify ownership
  const shop = await getShopByOwnerId(session!.user.id);
  if (!shop || shop.id !== shopId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get('page') ?? '1');
  const status = searchParams.get('status') ?? undefined;
  const pagination = getPaginationParams(page, 20);

  const result = await getShopBookings(shopId, pagination, status);
  return NextResponse.json(result);
}
