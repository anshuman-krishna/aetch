export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-error';
import { withRequestId } from '@/backend/middleware/request-log';
import { listShopsForMap } from '@/backend/services/shop-service';

export const GET = withErrorHandler(async (req: Request) => {
  const shops = await listShopsForMap();
  // re-shape into geojson-ish features so map clients can render directly
  const features = shops.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    city: s.city,
    country: s.country,
    image: s.image,
    verified: s.verified,
    lng: s.longitude,
    lat: s.latitude,
  }));
  return withRequestId(req, NextResponse.json({ success: true, shops: features }));
}, 'GET /api/shops/map');
