export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/backend/middleware/role-guard';
import { authGuard } from '@/backend/middleware/auth-guard';
import {
  createTattoo,
  getTattoos,
  isTattooSlugTaken,
} from '@/backend/services/tattoo-service';
import { createTattooSchema, tattooFilterSchema, paginationSchema } from '@/lib/validations';
import { slugify, slugWithCounter } from '@/utils/slugify';
import { getPaginationParams } from '@/utils/pagination';
import { uploadTattooImage } from '@/lib/upload';
import { indexTattoo } from '@/lib/search';
import type { TattooStyle, ColorType } from '@prisma/client';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  const filterResult = tattooFilterSchema.safeParse({
    styles: searchParams.getAll('styles'),
    bodyPlacement: searchParams.get('bodyPlacement') ?? undefined,
    colorType: searchParams.get('colorType') ?? undefined,
    search: searchParams.get('search') ?? undefined,
    sort: searchParams.get('sort') ?? 'latest',
  });

  const paginationResult = paginationSchema.safeParse({
    page: searchParams.get('page') ?? 1,
    limit: searchParams.get('limit') ?? 20,
  });

  const { page, limit } = paginationResult.success
    ? paginationResult.data
    : { page: 1, limit: 20 };

  const pagination = getPaginationParams(page, limit);

  const filters = filterResult.success ? filterResult.data : null;

  const result = await getTattoos(
    {
      styles: (filters?.styles as TattooStyle[] | undefined) ?? undefined,
      bodyPlacement: filters?.bodyPlacement,
      colorType: (filters?.colorType as ColorType | undefined) ?? undefined,
      search: filters?.search,
    },
    pagination,
    (filters?.sort as 'latest' | 'popular' | 'trending') ?? 'latest',
  );

  return NextResponse.json({ success: true, ...result });
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireRole('ARTIST', 'ADMIN');
  if (error) return error;

  // get artist record
  const { session: authSession, error: authError } = await authGuard();
  if (authError) return authError;

  const formData = await req.formData();
  const imageFile = formData.get('image') as File | null;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string | null;
  const stylesRaw = formData.getAll('styles') as string[];
  const bodyPlacement = formData.get('bodyPlacement') as string | null;
  const colorType = (formData.get('colorType') as string) ?? 'COLOR';

  // validate input
  const validation = createTattooSchema.safeParse({
    title,
    description: description ?? undefined,
    styles: stylesRaw,
    bodyPlacement: bodyPlacement ?? undefined,
    colorType,
  });

  if (!validation.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        issues: validation.error.issues,
      },
      { status: 400 },
    );
  }

  if (!imageFile) {
    return NextResponse.json(
      { success: false, error: 'Image is required' },
      { status: 400 },
    );
  }

  // process and upload image variants
  const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
  const uploadResult = await uploadTattooImage(
    imageBuffer,
    imageFile.type,
    authSession!.user.id,
  );

  // generate unique slug
  let slug = slugify(validation.data.title);
  let counter = 0;
  while (await isTattooSlugTaken(slug)) {
    counter++;
    slug = slugWithCounter(validation.data.title, counter);
  }

  // get artist id
  const { prisma } = await import('@/lib/prisma');
  const artist = await prisma.artist.findUnique({
    where: { userId: session!.user.id },
    select: { id: true, displayName: true, slug: true },
  });

  if (!artist) {
    return NextResponse.json(
      { success: false, error: 'Artist profile not found' },
      { status: 404 },
    );
  }

  const tattoo = await createTattoo({
    title: validation.data.title,
    slug,
    description: validation.data.description,
    imageUrl: uploadResult.imageUrl,
    thumbnailUrl: uploadResult.thumbnailUrl,
    blurDataUrl: uploadResult.blurDataUrl,
    width: uploadResult.width,
    height: uploadResult.height,
    styles: validation.data.styles as TattooStyle[],
    bodyPlacement: validation.data.bodyPlacement,
    colorType: validation.data.colorType as ColorType,
    artistId: artist.id,
  });

  // index in search (non-blocking)
  indexTattoo({
    id: tattoo.id,
    title: tattoo.title,
    description: tattoo.description ?? '',
    styles: tattoo.styles,
    bodyPlacement: tattoo.bodyPlacement ?? '',
    colorType: tattoo.colorType,
    artistName: artist.displayName,
    artistSlug: artist.slug,
  }).catch(() => {});

  return NextResponse.json({ success: true, tattoo }, { status: 201 });
}
