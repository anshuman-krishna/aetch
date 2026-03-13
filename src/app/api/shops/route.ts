import { NextResponse } from 'next/server';
import { getShops } from '@/backend/services/shop-service';
import { shopFilterSchema, paginationSchema } from '@/lib/validations';
import { getPaginationParams } from '@/utils/pagination';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const pageParsed = paginationSchema.safeParse({
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
  });
  const page = pageParsed.success ? pageParsed.data.page : 1;
  const limit = pageParsed.success ? pageParsed.data.limit : 20;

  const filterParsed = shopFilterSchema.safeParse({
    city: searchParams.get('city') || undefined,
    search: searchParams.get('search') || undefined,
    sort: searchParams.get('sort') || undefined,
  });

  const filters = filterParsed.success ? filterParsed.data : undefined;
  const pagination = getPaginationParams(page, limit);
  const result = await getShops(pagination, filters);

  return NextResponse.json(result);
}
