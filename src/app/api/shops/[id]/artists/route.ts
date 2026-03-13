import { NextResponse } from 'next/server';
import { requireRole } from '@/backend/middleware/role-guard';
import {
  getShopByOwnerId,
  getShopArtists,
  addArtistToShop,
  removeArtistFromShop,
} from '@/backend/services/shop-service';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const artists = await getShopArtists(id);
  return NextResponse.json({ artists });
}

export async function POST(req: Request, { params }: Params) {
  const { session, error } = await requireRole('SHOP_OWNER', 'ADMIN');
  if (error) return error;

  const { id: shopId } = await params;

  // verify ownership
  const shop = await getShopByOwnerId(session!.user.id);
  if (!shop || shop.id !== shopId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await req.json();
  const { artistId, role } = body;
  if (!artistId) {
    return NextResponse.json({ error: 'artistId required' }, { status: 400 });
  }

  try {
    const membership = await addArtistToShop(shopId, artistId, role);
    return NextResponse.json({ success: true, membership }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Artist already in shop' }, { status: 409 });
  }
}

export async function DELETE(req: Request, { params }: Params) {
  const { session, error } = await requireRole('SHOP_OWNER', 'ADMIN');
  if (error) return error;

  const { id: shopId } = await params;

  // verify ownership
  const shop = await getShopByOwnerId(session!.user.id);
  if (!shop || shop.id !== shopId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const artistId = searchParams.get('artistId');
  if (!artistId) {
    return NextResponse.json({ error: 'artistId required' }, { status: 400 });
  }

  try {
    await removeArtistFromShop(shopId, artistId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Artist not found in shop' }, { status: 404 });
  }
}
