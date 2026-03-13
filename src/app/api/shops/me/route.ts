import { NextResponse } from 'next/server';
import { requireRole } from '@/backend/middleware/role-guard';
import { getShopByOwnerId, updateShop } from '@/backend/services/shop-service';
import { updateShopSchema } from '@/lib/validations';

export async function GET() {
  const { session, error } = await requireRole('SHOP_OWNER', 'ADMIN');
  if (error) return error;

  const shop = await getShopByOwnerId(session!.user.id);
  if (!shop) {
    return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
  }

  return NextResponse.json({ shop });
}

export async function PATCH(req: Request) {
  const { session, error } = await requireRole('SHOP_OWNER', 'ADMIN');
  if (error) return error;

  const shop = await getShopByOwnerId(session!.user.id);
  if (!shop) {
    return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
  }

  const body = await req.json();
  const parsed = updateShopSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const updated = await updateShop(shop.id, parsed.data);
  return NextResponse.json({ success: true, shop: updated });
}
